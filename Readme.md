# YTD

New developer onboarding notes for running the mobile app on iOS simulator.

## Project Location

Mobile app source:

`createxyz-project_YTD/apps/mobile`

## Prerequisites (macOS)

Install and verify the following before first run:

1. Xcode (latest stable) from App Store
2. Xcode Command Line Tools
3. Node.js 20+
4. npm 10+
5. CocoaPods

Recommended tooling:

1. Watchman (`brew install watchman`)

Quick checks:

```bash
xcodebuild -version
node -v
npm -v
pod --version
```

## First-Time Setup

From this repository root (`YTD`):

```bash
cd createxyz-project_YTD/apps/mobile
npm install
```

Install iOS pods (first time and after native dependency changes):

```bash
cd ios
pod install
cd ..
```

## Run iOS Simulator (Build + Metro)

From `createxyz-project_YTD/apps/mobile`:

```bash
npm run ios
```

What this does:

1. Builds native iOS app using Expo run workflow (`expo run:ios`)
2. Boots/opens an iOS simulator
3. Starts Metro bundler for JS/TS

## Day-to-Day Development

Typical flow:

1. Start in `createxyz-project_YTD/apps/mobile`
2. Run `npm run ios`
3. Keep Metro terminal open while developing

Useful resets when things get stuck:

```bash
# inside createxyz-project_YTD/apps/mobile
npx expo start -c
```

If iOS native builds fail after dependency updates:

```bash
cd ios
pod install
cd ..
npm run ios
```

## Troubleshooting

If no simulator launches:

1. Open Xcode once and accept licenses/components
2. Open Simulator app manually, then rerun `npm run ios`

If Metro port is busy:

```bash
lsof -i :8081
kill -9 <PID>
```

If pods are out of sync:

```bash
cd ios
pod repo update
pod install
cd ..
```
