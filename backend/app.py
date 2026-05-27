from flask import Flask, request, jsonify
from flask_cors import CORS
from supabase import create_client, Client
from dotenv import load_dotenv
import pandas as pd
import random
import re
import os
import joblib

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.svm import LinearSVC
from sklearn.pipeline import Pipeline
from sklearn.calibration import CalibratedClassifierCV
from sklearn.model_selection import train_test_split

# ── Chargement des variables d'environnement ─────────────────
load_dotenv()

app = Flask(__name__)
CORS(app, origins=[
    "https://detector-spam.onrender.com"
])

# CORS : autoriser uniquement votre frontend déployé
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")
CORS(app, origins=[FRONTEND_URL, "http://localhost:5173", "http://localhost:3000"])

# ── Connexion Supabase ────────────────────────────────────────
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    raise ValueError("SUPABASE_URL et SUPABASE_KEY doivent être définis dans .env")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
print("✅ Connexion Supabase établie")


# ── Stopwords français ────────────────────────────────────────
SW_FR = {
    'le','la','les','un','une','des','de','du','et','en','au','aux',
    'ce','qui','que','je','tu','il','elle','nous','vous','ils','elles',
    'on','me','te','se','mon','ton','son','ma','ta','sa','notre','votre',
    'leur','mes','tes','ses','nos','vos','leurs','y','si','mais','ou',
    'donc','or','ni','car','ne','pas','plus','par','sur','pour','avec',
    'dans','est','sont','être','avoir','a','à','cette','cet','ces',
}


# ── Nettoyage NLP ─────────────────────────────────────────────
def clean_fr(text):
    text = text.lower()
    text = re.sub(r'http\S+|www\S+', ' URL ', text)
    text = re.sub(r'0[67]\d{8}', ' TELEPHONE ', text)
    text = re.sub(r'\d+[,.]?\d*\s*€', ' MONTANT ', text)
    text = re.sub(r'\d+', ' ', text)
    text = re.sub(r'[^\w\s]', ' ', text)
    tokens = text.split()
    tokens = [w for w in tokens if w not in SW_FR and len(w) > 2]
    return ' '.join(tokens)


# ── Génération dataset synthétique français ───────────────────
def generate_dataset(n=1000):
    random.seed(42)
    spam_t = [
        "FÉLICITATIONS ! Vous avez gagné {prix} € ! Appelez le {tel} MAINTENANT !",
        "URGENT : Votre compte sera suspendu. Cliquez ici : {url}",
        "Offre EXCLUSIVE : {remise}% de réduction ! Valable {duree}h seulement",
        "Vous avez été sélectionné pour recevoir un cadeau gratuit. Répondez OUI",
        "Votre colis est bloqué. Payez {frais}€ de frais : {url}",
        "Crédit IMMÉDIAT jusqu'à {montant}€ sans justificatif. Appelez {tel}",
        "Alerte sécurité : connectez-vous sur {url} pour vérifier votre compte",
        "Investissez en crypto et gagnez {remise}% par jour garanti !",
        "DERNIER RAPPEL : facture de {frais}€ impayée. Réglez : {url}",
        "Votre abonnement expire. Renouvelez sur {url} avant minuit",
        "PROMO FLASH : {remise}% sur toute la boutique ! {url}",
        "Votre carte bancaire utilisée frauduleusement. Vérifiez : {url}",
    ]
    ham_t = [
        "Bonjour, on se retrouve à {heure}h demain pour le déjeuner ?",
        "Tu peux m'appeler quand tu es disponible stp ?",
        "J'arrive dans {duree} minutes, tu es déjà là ?",
        "Super soirée hier ! Merci pour l'invitation.",
        "N'oublie pas la réunion à {heure}h en salle {salle}",
        "Peux-tu acheter du pain et du lait en rentrant ?",
        "Le rapport est prêt, je te l'envoie par mail.",
        "Tu as regardé le match hier soir ? Incroyable !",
        "Appel manqué, rappelle-moi dès que tu peux.",
        "On se voit ce weekend ? Il y a une expo sympa.",
        "Bonne nuit ! À demain pour la formation.",
        "La réunion est décalée, préviens les autres stp.",
    ]
    def gs():
        t = random.choice(spam_t)
        return t.format(
            prix=random.randint(100,5000),
            tel="06"+str(random.randint(10000000,99999999)),
            url="http://promo-"+str(random.randint(100,999))+".fr",
            remise=random.randint(30,90), duree=random.randint(1,48),
            frais=round(random.uniform(1,9),2), montant=random.randint(500,50000),
        )
    def gh():
        t = random.choice(ham_t)
        return t.format(
            heure=random.randint(8,20), duree=random.randint(5,45),
            salle=random.choice(['A','B','C'])+str(random.randint(1,9)),
        )
    half = n // 2
    msgs = [(gs(),1) for _ in range(half)] + [(gh(),0) for _ in range(half)]
    random.shuffle(msgs)
    return pd.DataFrame(msgs, columns=['texte','label'])


# ── Entraînement SVM ──────────────────────────────────────────
MODEL_PATH = 'spam_detector_fr.pkl'

def train_model():
    print("Génération du dataset et entraînement...")
    df = generate_dataset(n=1000)
    df['texte_clean'] = df['texte'].apply(clean_fr)
    X, y = df['texte_clean'], df['label']
    X_train, X_test, y_train, _ = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    pipeline = Pipeline([
        ('tfidf', TfidfVectorizer(max_features=2000, ngram_range=(1,2), sublinear_tf=True, min_df=2)),
        ('svm',   CalibratedClassifierCV(LinearSVC(C=1.0, max_iter=2000, random_state=42)))
    ])
    pipeline.fit(X_train, y_train)
    joblib.dump(pipeline, MODEL_PATH)
    print("✅ Modèle entraîné et sauvegardé")
    return pipeline

if os.path.exists(MODEL_PATH):
    model = joblib.load(MODEL_PATH)
    print("✅ Modèle chargé depuis le fichier")
else:
    model = train_model()


# ══════════════════════════════════════════════════════════════
#  ROUTES FLASK
# ══════════════════════════════════════════════════════════════

# ── POST /predict ─────────────────────────────────────────────
@app.route('/predict', methods=['POST'])
def predict():
    data    = request.get_json()
    message = data.get('message', '').strip()

    if not message:
        return jsonify({'error': 'Message vide'}), 400

    # Prédiction SVM
    clean      = clean_fr(message)
    pred       = model.predict([clean])[0]
    proba      = model.predict_proba([clean])[0]
    spam_score = round(float(proba[1]) * 100, 1)
    ham_score  = round(float(proba[0]) * 100, 1)
    label      = 'spam' if pred == 1 else 'ham'

    # Mots-clés détectés
    spam_keywords = ['gratuit','urgent','félicitation','gagné','gagnant',
                     'offre','promo','exclusif','crédit','réclamez','url',
                     'telephone','montant','sélectionné','cliquez','alerte']
    detected = [w for w in clean.lower().split() if w in spam_keywords][:5]

    # ── Sauvegarder dans Supabase ─────────────────────────────
    try:
        supabase.table('analyses').insert({
            'message':    message,
            'clean_text': clean,
            'label':      label,
            'spam_score': spam_score,
            'ham_score':  ham_score,
            'keywords':   detected,
        }).execute()
    except Exception as e:
        print(f"⚠️  Erreur Supabase insert : {e}")
        # On continue quand même — l'analyse reste valide

    return jsonify({
        'label':      label,
        'spam_score': spam_score,
        'ham_score':  ham_score,
        'keywords':   detected,
        'clean_text': clean,
    })


# ── GET /history ──────────────────────────────────────────────
@app.route('/history', methods=['GET'])
def get_history():
    limit  = min(int(request.args.get('limit', 50)), 100)
    label  = request.args.get('label')   # filtre optionnel : 'spam' ou 'ham'
    search = request.args.get('search')  # recherche texte optionnelle

    try:
        query = supabase.table('analyses') \
            .select('id, message, label, spam_score, ham_score, keywords, created_at') \
            .order('created_at', desc=True) \
            .limit(limit)

        if label in ('spam', 'ham'):
            query = query.eq('label', label)

        response = query.execute()
        items = response.data or []

        # Filtre recherche côté Python (Supabase free ne supporte pas ilike facilement)
        if search:
            search_lower = search.lower()
            items = [i for i in items if search_lower in i['message'].lower()]

        return jsonify({'data': items, 'count': len(items)})

    except Exception as e:
        print(f"⚠️  Erreur Supabase select : {e}")
        return jsonify({'error': str(e)}), 500


# ── GET /stats ────────────────────────────────────────────────
@app.route('/stats', methods=['GET'])
def get_stats():
    try:
        res = supabase.table('analyses').select('label, spam_score, ham_score').execute()
        items = res.data or []

        total      = len(items)
        total_spam = sum(1 for i in items if i['label'] == 'spam')
        total_ham  = sum(1 for i in items if i['label'] == 'ham')
        avg_score  = round(
            sum(i['spam_score'] if i['label']=='spam' else i['ham_score'] for i in items) / total, 1
        ) if total else 0

        return jsonify({
            'total':      total,
            'spam':       total_spam,
            'ham':        total_ham,
            'avg_score':  avg_score,
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500


# ── DELETE /history ───────────────────────────────────────────
@app.route('/history', methods=['DELETE'])
def delete_history():
    try:
        # Supprimer tous les enregistrements
        supabase.table('analyses').delete().neq('id', 0).execute()
        return jsonify({'status': 'ok', 'message': 'Historique effacé'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500


# ── POST /retrain ─────────────────────────────────────────────
@app.route('/retrain', methods=['POST'])
def retrain():
    global model
    model = train_model()
    return jsonify({'status': 'ok', 'message': 'Modèle réentraîné !'})


# ── GET /health ───────────────────────────────────────────────
@app.route('/health', methods=['GET'])
def health():
    try:
        supabase.table('analyses').select('id').limit(1).execute()
        db_status = 'ok'
    except Exception:
        db_status = 'error'
    return jsonify({'flask': 'ok', 'supabase': db_status, 'model': 'loaded'})


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=False)