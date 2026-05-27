# Détecteur de Spam Français — SVM + Flask

Interface web pour détecter les emails et SMS spam en français,
construite avec Flask et un modèle SVM entraîné sur des données synthétiques françaises.

## Structure du projet

```
spam_detector_flask/
├── app.py               # Serveur Flask + logique ML
├── requirements.txt     # Dépendances Python
├── templates/
│   └── index.html       # Interface web
└── README.md
```

## Installation et lancement

### 1. Créer un environnement virtuel (recommandé)
```bash
python -m venv venv
# Windows :
venv\Scripts\activate
# Mac/Linux :
source venv/bin/activate
```

### 2. Installer les dépendances
```bash
pip install -r requirements.txt
```

### 3. Lancer le serveur
```bash
python app.py
```

### 4. Ouvrir dans le navigateur
```
http://localhost:5000
```

## Fonctionnalités

- Analyse de messages en temps réel
- Score de confiance spam/ham en pourcentage
- Affichage des mots indicateurs détectés
- Aperçu du texte après nettoyage NLP
- Historique des 6 dernières analyses
- Exemples cliquables (spam et ham)
- Raccourci Ctrl+Entrée pour analyser

## API REST

### POST /predict
```json
// Requête
{ "message": "URGENT ! Vous avez gagné 500€ !" }

// Réponse
{
  "label": "spam",
  "spam_score": 98.3,
  "ham_score": 1.7,
  "keywords": ["urgent", "gagner", "montant"],
  "clean_text": "urgent gagner montant"
}
```

### POST /retrain
Réentraîne le modèle avec un nouveau dataset généré.
```json
{ "status": "ok", "message": "Modèle réentraîné avec succès !" }
```

## Pipeline ML

1. **Génération** : 1000 messages synthétiques français (500 spam + 500 ham)
2. **Nettoyage NLP** : minuscules, suppression URLs/téléphones/montants, stopwords français
3. **Vectorisation** : TF-IDF (2000 features, bigrammes, sublinear_tf)
4. **Modèle** : LinearSVC + CalibratedClassifierCV (pour predict_proba)
5. **Performance** : ~96% accuracy sur les données de test