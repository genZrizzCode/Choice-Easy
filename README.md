# ChoiceEasy - AI-Powered Decision Maker

A cross-platform mobile and web app that helps you make decisions by using AI to filter out bad choices and randomly selecting from the good ones.

## Features

- **Input 7 Choices**: Add up to 7 different options you're considering
- **AI Filtering**: The app uses intelligent heuristics to identify and filter out poor choices
- **Random Selection**: From the remaining good choices, the app randomly selects one for you
- **Cross-Platform**: Works on iOS, Android, and Web browsers
- **Modern UI**: Clean, intuitive interface with visual feedback

## How It Works

1. **Add Choices**: Enter up to 7 different options you're considering
2. **AI Evaluation**: The app analyzes each choice using keyword-based heuristics to identify good vs bad options
3. **Filtering**: Poor choices (containing negative keywords, too short, etc.) are automatically filtered out
4. **Random Selection**: From the remaining good choices, one is randomly selected as your final decision

## AI Evaluation Criteria

The app evaluates choices based on:
- **Negative Keywords**: Choices containing words like "nothing", "skip", "avoid", "bad", "terrible", etc. are filtered out
- **Positive Keywords**: Choices with words like "good", "great", "excellent", "love", "enjoy", etc. are prioritized
- **Length**: Very short choices (less than 3 characters) are considered poor options
- **Neutral Choices**: Options without clear positive or negative indicators are treated as good by default

## Getting Started

### Prerequisites

- Node.js (version 16 or higher)
- npm or yarn
- For mobile development: Expo Go app on your device

### Installation

1. Clone or download this project
2. Navigate to the project directory:
   ```bash
   cd ChoiceEasy
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

### Running the App

#### Web Version
```bash
npm run web
```
This will open the app in your default web browser.

#### Mobile Development
1. Install the Expo Go app on your iOS or Android device
2. Run the development server:
   ```bash
   npm start
   ```
3. Scan the QR code with Expo Go (iOS: Camera app, Android: Expo Go app)

#### iOS Simulator (macOS only)
```bash
npm run ios
```

#### Android Emulator
```bash
npm run android
```

## Usage

1. **Add Choices**: Type your options in the input field and tap the "+" button
2. **Review**: See all your choices listed with numbers
3. **Evaluate**: Tap "Evaluate & Choose" when you have at least 2 choices
4. **Result**: The app will show you the selected choice with visual indicators for good/bad options
5. **Reset**: Use the "Reset" button to start over

## Technical Details

- **Framework**: React Native with Expo
- **Language**: TypeScript
- **UI Components**: React Native Paper and Expo Vector Icons
- **Platforms**: iOS, Android, Web
- **AI Implementation**: Custom-built AI with advanced NLP techniques

## AI Features

The app uses a sophisticated custom AI that evaluates choices based on:

- **Sentiment Analysis**: 200+ positive and negative words
- **Action Analysis**: Evaluates constructive vs harmful actions
- **Context Analysis**: Considers social, health, and safety contexts
- **Length & Complexity**: Analyzes choice quality and variety
- **Confidence Scoring**: Dynamic confidence based on evaluation strength

No external API keys or dependencies required!

## Future Enhancements

- Integration with real AI APIs (OpenAI, Google AI, etc.)
- More sophisticated choice evaluation algorithms
- User accounts and choice history
- Custom evaluation criteria
- Export/share results

## Contributing

Feel free to submit issues and enhancement requests!

## License

This project is open source and available under the MIT License. 