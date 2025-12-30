
# BiblioTech - La tua Libreria Digitale

Benvenuto in **BiblioTech**, un'applicazione web moderna progettata per gli amanti della lettura. Questa piattaforma ti permette di gestire il tuo catalogo personale di libri, tracciare cosa stai leggendo e mantenere una lista dei tuoi titoli pubblicati o desiderati.

## 🚀 Architettura del Progetto

L'applicazione è costruita seguendo i principi della **Clean Architecture** e della modularità in React:

### 1. Frontend (UI/UX)
- **React 18+ & TypeScript**: Utilizziamo componenti funzionali e hook per una gestione dello stato reattiva e tipizzata.
- **Tailwind CSS**: Per uno stile elegante, responsive e altamente personalizzabile. Abbiamo scelto una palette cromatica "Indigo & Slate" per un look professionale e accogliente.
- **Interattività**: Animazioni fluide per i modali e hover states curati.

### 2. Gestione dei Dati (Storage)
- **LocalStorage Service**: Tutti i dati (utenti e libri) sono persistiti localmente nel browser dell'utente. 
- **Gestione Immagini**: Le copertine caricate dall'utente vengono convertite in **Base64** per consentire il salvataggio diretto nel `localStorage` senza server esterni.
- **Mock Auth**: Sistema di sessione locale per gestire collezioni private.

### 3. Intelligenza Artificiale (Gemini API)
L'app integra il modello `gemini-3-flash-preview` per:
- **Generazione Automatica di Descrizioni**: Crea sinossi professionali partendo da titolo e autore.

## 🛠️ Funzionalità Principali

- **Autenticazione**: Login e registrazione simulata.
- **CRUD Completo**: Aggiungi, modifica (inclusa l'immagine) e rimuovi libri.
- **Caricamento Copertine**: Personalizza la tua libreria caricando file locali (PNG/JPG).
- **Filtri Intelligenti**: Passa dalla visualizzazione globale a quella personale con un click.

## 📦 Come Iniziare

1. Assicurati che l'ambiente abbia accesso alla `API_KEY` di Gemini.
2. Registrati o accedi.
3. Clicca su "Aggiungi Titolo" per iniziare.
4. Per modificare un libro o la sua immagine, usa l'icona della matita sulla card del libro.

---
*Sviluppato con passione per i lettori digitali.*
