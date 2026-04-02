# Firebase App Distribution — Setup Guide

This template ships with a ready-to-use CI workflow that builds the mobile app and
distributes it to testers via **Firebase App Distribution**. Follow the steps below
once per project (≈ 20 min).

---

## 1. Create a Firebase project

1. Go to [console.firebase.google.com](https://console.firebase.google.com) → **Add project**
2. Name it (e.g. `moni-staging`) — use separate projects for staging and production
3. Enable **Google Analytics** if desired (optional for App Distribution)

---

## 2. Register your apps in Firebase

### Android

1. Console → Project Settings → **Add app** → Android
2. **Android package name**: `com.moni.mobile`
   (Update `apps/mobile/android/app/build.gradle` → `applicationId` to match)
3. Download **google-services.json**
4. Place it at `apps/mobile/android/app/google-services.json`
   *(This file is gitignored — never commit it)*
5. Note the **App ID** shown in the console (format: `1:xxxxxx:android:xxxxxx`)

### iOS

1. Console → Project Settings → **Add app** → Apple
2. **Apple bundle ID**: `com.moni.mobile`
   (Update `apps/mobile/ios/MoniMobile/Info.plist` → `CFBundleIdentifier` to match)
3. Download **GoogleService-Info.plist**
4. Place it at `apps/mobile/ios/MoniMobile/GoogleService-Info.plist`
   *(This file is gitignored — never commit it)*
5. Note the **App ID** shown in the console (format: `1:xxxxxx:ios:xxxxxx`)

---

## 3. Create a Firebase service account

The CI workflow authenticates using a service account, which is safer than personal
tokens and works in automated environments.

1. Firebase console → Project Settings → **Service accounts**
2. Click **Generate new private key** → download the JSON file
3. Base64-encode it:
   ```bash
   base64 -i firebase-service-account.json | pbcopy   # macOS
   base64 -w 0 firebase-service-account.json           # Linux
   ```
4. Add to GitHub Secrets (next step)

---

## 4. Add GitHub Secrets

Navigate to your GitHub repository → **Settings → Secrets and variables → Actions**.

### Required (Android)

| Secret | Value |
|---|---|
| `GOOGLE_SERVICES_JSON` | base64 of `google-services.json` |
| `FIREBASE_APP_ID_ANDROID` | Android App ID from Firebase console |
| `FIREBASE_SERVICE_ACCOUNT` | base64 of service account JSON (step 3) |

```bash
# Encode google-services.json
base64 -i apps/mobile/android/app/google-services.json | pbcopy   # macOS
```

### Optional (signed release APK)

| Secret | Value |
|---|---|
| `ANDROID_KEYSTORE_BASE64` | base64 of your `.keystore` / `.jks` file |
| `ANDROID_KEY_ALIAS` | Key alias |
| `ANDROID_KEY_PASSWORD` | Key password |
| `ANDROID_STORE_PASSWORD` | Keystore password |

To generate a keystore for the first time:
```bash
keytool -genkey -v \
  -keystore moni-release.keystore \
  -alias moni \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000
```

Then encode:
```bash
base64 -i moni-release.keystore | pbcopy
```

### Optional (iOS)

| Secret | Value |
|---|---|
| `GOOGLE_SERVICE_INFO_PLIST` | base64 of `GoogleService-Info.plist` |
| `FIREBASE_APP_ID_IOS` | iOS App ID from Firebase console |
| `IOS_PROVISIONING_PROFILE` | base64 of your `.mobileprovision` |
| `IOS_SIGNING_CERTIFICATE` | base64 of your `.p12` distribution certificate |
| `IOS_SIGNING_CERTIFICATE_PASSWORD` | Password for the `.p12` certificate |

---

## 5. Create a tester group in Firebase

1. Firebase console → App Distribution → **Testers & Groups**
2. Create a group named `testers` (matches the workflow default)
3. Add tester email addresses

You can also create additional groups (e.g. `qa`, `stakeholders`) and pass them
when triggering the workflow manually via `tester_groups` input.

---

## 6. First distribution

### Automatic (push to `develop`)

Every push to `develop` that changes mobile or shared package files automatically
builds and distributes an Android debug APK to the `testers` group.

### Manual (any platform)

Go to **Actions → Firebase App Distribution → Run workflow**:

| Input | Description |
|---|---|
| `platform` | `android`, `ios`, or `all` |
| `release_notes` | Custom message shown to testers (auto-generated if empty) |
| `tester_groups` | Comma-separated group names |

### iOS note

iOS builds use `macos-latest` runners which are billed at ~10× the cost of
`ubuntu-latest`. The workflow intentionally restricts iOS to manual dispatch only.
Consider using [Xcode Cloud](https://developer.apple.com/xcode-cloud/) for
automated iOS builds as a cost-effective alternative.

---

## 7. Upgrade to signed release APK

The default workflow builds a **debug APK**. It is sufficient for internal testing
but cannot be uploaded to the Play Store. To switch to a signed release build:

1. Add the `ANDROID_KEYSTORE_*` secrets (step 4)
2. In `apps/mobile/android/app/build.gradle`, configure the `signingConfigs` block:
   ```groovy
   signingConfigs {
     release {
       storeFile file(System.getenv("KEYSTORE_FILE") ?: "debug.keystore")
       storePassword System.getenv("STORE_PASSWORD") ?: ""
       keyAlias System.getenv("KEY_ALIAS") ?: ""
       keyPassword System.getenv("KEY_PASSWORD") ?: ""
     }
   }
   buildTypes {
     release {
       signingConfig signingConfigs.release
       minifyEnabled true
       proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
     }
   }
   ```
3. In `.github/workflows/firebase-distribution.yml`, uncomment the
   **"Build Android Release APK"** block and comment out the debug build step

---

## File reference

| File | Purpose |
|---|---|
| `.github/workflows/firebase-distribution.yml` | CI/CD workflow |
| `apps/mobile/android/app/google-services.json.example` | Android Firebase config template |
| `apps/mobile/ios/GoogleService-Info.plist.example` | iOS Firebase config template |
| `apps/mobile/ios/ExportOptions.plist` | Xcode export settings for IPA |
