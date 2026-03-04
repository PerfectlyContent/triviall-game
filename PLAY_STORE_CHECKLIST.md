# TriviAll - Google Play Store Submission Checklist

## Project Setup (Done)

- [x] Capacitor configured with Android platform
- [x] App ID: `com.triviall.game`
- [x] Version: 1.0.0 (versionCode: 1)
- [x] App icons generated (all Android density buckets)
- [x] Splash screens generated (portrait + landscape)
- [x] PWA manifest with metadata
- [x] Service worker for offline caching
- [x] ProGuard / minification enabled for release builds
- [x] App signing config ready (environment variable based)

## Before Submission - You Need To Do

### 1. Generate a Signing Key

```bash
keytool -genkey -v -keystore triviall-release.jks -keyalg RSA -keysize 2048 -validity 10000 -alias triviall
```

Keep this keystore file safe — you'll need it for every future update.

### 2. Set Environment Variables for Signing

```bash
export TRIVIALL_KEYSTORE_FILE=/path/to/triviall-release.jks
export TRIVIALL_KEYSTORE_PASSWORD=your_password
export TRIVIALL_KEY_ALIAS=triviall
export TRIVIALL_KEY_PASSWORD=your_password
```

### 3. Build the Release AAB (Android App Bundle)

```bash
npm run build                  # Build web app
npx cap sync android           # Sync to Android
cd android
./gradlew bundleRelease        # Generate AAB for Play Store
```

The AAB will be at: `android/app/build/outputs/bundle/release/app-release.aab`

### 4. Google Play Console Requirements

#### Store Listing
- **App name**: TriviAll
- **Short description** (80 chars max): "AI-powered multiplayer trivia — play with friends across 12 subjects!"
- **Full description** (4000 chars max): See suggested text below
- **App category**: Games > Trivia
- **Content rating**: Complete the questionnaire (likely Everyone)

#### Graphics Assets Needed
- **App icon**: 512x512 PNG (already generated at `public/icons/icon-512x512.png`)
- **Feature graphic**: 1024x500 PNG (you need to create this)
- **Phone screenshots**: At least 2, recommended 8 (min 320px, max 3840px per side)
- **Tablet screenshots**: Optional but recommended (7-inch and 10-inch)

#### Privacy & Policies
- **Privacy policy URL**: Required — create and host one for your app
- **Data safety form**: Complete in Play Console (app uses internet, Supabase for data)

#### Content Rating
- Complete the IARC questionnaire in Play Console

### 5. Suggested Full Description

```
TriviAll is the ultimate multiplayer trivia game powered by AI! Challenge your
friends locally on the same device or play online across the world.

FEATURES:
🎮 Two play modes — Local (pass & play) and Online (real-time multiplayer)
🧠 AI-generated questions that are always fresh and unique
📚 12 exciting subjects — Science, History, Gaming, Movies, Music, Sports, Nature, Food, Travel, Pop Culture, Art, and Technology
🌍 Play in 5 languages — English, Spanish, German, Russian, and Polish
⚡ Dynamic difficulty that adapts to your skill level
🏆 Scoring with streak bonuses and time multipliers
🎉 Fun awards and achievements at the end of each game
👶 Kid-friendly mode for ages 6-12

HOW TO PLAY:
1. Create a game or join with a room code
2. Pick your subjects and settings
3. Answer questions faster for bonus points
4. Build answer streaks for score multipliers
5. Compete for the top spot on the leaderboard!

Perfect for family game nights, parties, or challenging friends online. With
AI-generated questions, you'll never see the same question twice!
```

### 6. App Signing with Google Play

Consider enrolling in **Google Play App Signing** (recommended):
- Google manages your app signing key
- You upload with an upload key
- More secure and allows key recovery

## Quick Commands Reference

```bash
# Development
npm run dev                    # Start dev server
npm run build                  # Build for production

# Icons
npm run icons                  # Regenerate all icons

# Android
npm run cap:build              # Build + sync to Android
npm run cap:open               # Open in Android Studio
npx cap sync android           # Sync web assets to Android

# Release build
cd android && ./gradlew bundleRelease
```
