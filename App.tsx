import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform,
  Appearance,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { MaterialIcons } from '@expo/vector-icons';
import { CustomAI, ChoiceEvaluation } from './services/customAI';
import * as Font from 'expo-font';
import { RampartOne_400Regular } from '@expo-google-fonts/rampart-one';


interface Choice {
  id: number;
  text: string;
  isGood: boolean | null; // null = not evaluated, true = good, false = bad
  reasoning?: string;
  confidence?: number;
}

export default function App() {
  const [choices, setChoices] = useState<Choice[]>([]);
  const [currentInput, setCurrentInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [showActivityPicker, setShowActivityPicker] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState<boolean | null>(null);
  const [isQuickMode, setIsQuickMode] = useState(false);
  const systemColorScheme = Appearance.getColorScheme();

  useEffect(() => {
    async function loadFonts() {
      await Font.loadAsync({
        'RampartOne': RampartOne_400Regular,
      });
      setFontsLoaded(true);
    }
    loadFonts();
  }, []);

  const addChoice = () => {
    if (currentInput.trim() === '') {
      Alert.alert('Error', 'Please enter a choice');
      return;
    }
    
    if (choices.length >= 7) {
      Alert.alert('Error', 'You can only have 7 choices');
      return;
    }

    const newChoice: Choice = {
      id: Date.now(),
      text: currentInput.trim(),
      isGood: null,
    };

    setChoices([...choices, newChoice]);
    setCurrentInput('');
  };

  const removeChoice = (id: number) => {
    setChoices(choices.filter(choice => choice.id !== id));
    setSelectedChoice(null);
    setShowResult(false);
  };

  const evaluateChoices = async () => {
    if (choices.length < 2) {
      Alert.alert('Error', 'Please add at least 2 choices');
      return;
    }

    setIsProcessing(true);
    
          try {
        // Use custom AI to evaluate choices
        const choiceTexts = choices.map(choice => choice.text);
        const evaluationResults: ChoiceEvaluation[] = await CustomAI.evaluateChoices(choiceTexts);

        // Update choices with AI evaluation results
        const evaluatedChoices = choices.map((choice, index) => {
          const evaluation = evaluationResults[index];
          return {
            ...choice,
            isGood: evaluation.isGood,
            reasoning: evaluation.reasoning,
            confidence: evaluation.confidence,
          };
        });

      setChoices(evaluatedChoices);
      
      // Select from good choices
      const goodChoices = evaluatedChoices.filter(choice => choice.isGood);
      
      if (goodChoices.length === 0) {
        Alert.alert('No Good Choices', 'All choices were filtered out. Please add better options.');
        return;
      }

      // Randomly select from good choices
      const randomIndex = Math.floor(Math.random() * goodChoices.length);
      const winner = goodChoices[randomIndex];
      
      setSelectedChoice(winner.text);
      setShowResult(true);
      
    } catch (error) {
      Alert.alert('Error', 'Failed to evaluate choices. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };



  const resetApp = () => {
    setChoices([]);
    setCurrentInput('');
    setSelectedChoice(null);
    setShowResult(false);
    setShowActivityPicker(false);
  };

  const toggleDarkMode = () => {
    if (isDarkMode === null) {
      // If using system preference, switch to opposite of system
      setIsDarkMode(systemColorScheme === 'light');
    } else {
      // If manual mode, just toggle
      setIsDarkMode(!isDarkMode);
    }
  };

  const generateQuickChoice = async () => {
    setIsProcessing(true);
    try {
      // Generate a random safe choice
      const randomActivity = preMadeActivities[Math.floor(Math.random() * preMadeActivities.length)];
      
      // Evaluate it with AI
      const evaluation = await CustomAI.evaluateChoices([randomActivity]);
      
      if (evaluation[0].isGood) {
        setSelectedChoice(randomActivity);
        setShowResult(true);
        setIsQuickMode(true);
      } else {
        // If not good, try again
        generateQuickChoice();
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to generate choice. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Use system preference as default, but allow manual override
  const actualDarkMode = isDarkMode !== null ? isDarkMode : systemColorScheme === 'dark';

  const preMadeActivities = [
    'Go for a walk',
    'Read a book',
    'Call a friend',
    'Cook a meal',
    'Watch a movie',
    'Listen to music',
    'Take a nap',
    'Exercise',
    'Write in a journal',
    'Learn something new',
    'Visit a museum',
    'Try a new restaurant',
    'Go to the park',
    'Take photos',
    'Play a game',
    'Meditate',
    'Draw or paint',
    'Clean your space',
    'Plan a trip',
    'Volunteer',
    'Go shopping',
    'Visit family',
    'Try a new hobby',
    'Go to the gym',
    'Watch the sunset',
    'Write a letter',
    'Learn to cook',
    'Go hiking',
    'Visit a library',
    'Start a project'
  ];

  const addRandomActivity = () => {
    if (choices.length >= 7) {
      Alert.alert('Error', 'You can only have 7 choices');
      return;
    }

    const randomActivity = preMadeActivities[Math.floor(Math.random() * preMadeActivities.length)];
    const newChoice: Choice = {
      id: Date.now(),
      text: randomActivity,
      isGood: null,
    };

    setChoices([...choices, newChoice]);
  };

  const getStatusColor = (isGood: boolean | null) => {
    if (isGood === null) return '#666';
    return isGood ? '#4CAF50' : '#F44336';
  };

  const getStatusIcon = (isGood: boolean | null) => {
    if (isGood === null) return 'help-outline';
    return isGood ? 'check-circle' : 'cancel';
  };

  if (!fontsLoaded) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={[actualDarkMode ? styles.containerDark : styles.container, { pointerEvents: 'auto' }]}>
      <StatusBar style={actualDarkMode ? 'light' : 'auto'} />
      
      <View style={[styles.header, actualDarkMode && styles.headerDark]}>
        <View style={styles.headerContent}>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>ChoiceEasy</Text>
            <Text style={styles.subtitle}>AI-Powered Decision Maker</Text>
          </View>
          <TouchableOpacity
            style={styles.darkModeToggle}
            onPress={toggleDarkMode}
            activeOpacity={0.7}
          >
            <MaterialIcons 
              name={actualDarkMode ? 'light-mode' : 'dark-mode'} 
              size={24} 
              color="white" 
            />
          </TouchableOpacity>
      </View>
    </View>

              <ScrollView style={[styles.content, actualDarkMode && styles.contentDark]} showsVerticalScrollIndicator={false}>
          {/* Input Section */}
          <View style={styles.inputSection}>
            <Text style={[styles.sectionTitle, actualDarkMode && styles.sectionTitleDark]}>Add Your Choices ({choices.length}/7)</Text>
          
          <View style={styles.inputContainer}>
            <TextInput
              style={[styles.input, actualDarkMode && styles.inputDark]}
              value={currentInput}
              onChangeText={setCurrentInput}
              placeholder="Enter a choice..."
              placeholderTextColor={actualDarkMode ? "#666" : "#999"}
              onSubmitEditing={addChoice}
            />
            <TouchableOpacity
              style={[styles.addButton, choices.length >= 7 && styles.disabledButton]}
              onPress={addChoice}
              disabled={choices.length >= 7}
              activeOpacity={0.7}
            >
              <MaterialIcons name="add" size={24} color="white" />
            </TouchableOpacity>
          </View>
          
          {/* Random Activity Button */}
          <TouchableOpacity
            style={[styles.randomActivityButton, choices.length >= 7 && styles.disabledButton]}
            onPress={addRandomActivity}
            disabled={choices.length >= 7}
            activeOpacity={0.7}
          >
            <MaterialIcons name="casino" size={20} color="white" />
            <Text style={styles.randomActivityText}>Add Random Activity</Text>
          </TouchableOpacity>
        </View>

        {/* Choices List */}
        {choices.length > 0 && (
          <View style={styles.choicesSection}>
            <Text style={[styles.sectionTitle, actualDarkMode && styles.sectionTitleDark]}>Your Choices</Text>
            {choices.map((choice, index) => (
              <View key={choice.id} style={[styles.choiceItem, actualDarkMode && styles.choiceItemDark]}>
                <View style={styles.choiceContent}>
                  <Text style={[styles.choiceNumber, actualDarkMode && styles.choiceNumberDark]}>{index + 1}.</Text>
                  <Text style={[styles.choiceText, actualDarkMode && styles.choiceTextDark]}>{choice.text}</Text>
                  {choice.isGood !== null && (
                    <View style={styles.statusContainer}>
                      <MaterialIcons
                        name={getStatusIcon(choice.isGood) as any}
                        size={20}
                        color={getStatusColor(choice.isGood)}
                        style={styles.statusIcon}
                      />
                      {choice.confidence && (
                        <Text style={styles.confidenceText}>
                          {Math.round(choice.confidence * 100)}%
                        </Text>
                      )}
                    </View>
                  )}
                </View>
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => removeChoice(choice.id)}
                  activeOpacity={0.7}
                >
                  <MaterialIcons name="delete" size={20} color="#F44336" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actionSection}>
          {choices.length >= 2 && (
            <TouchableOpacity
              style={[styles.evaluateButton, isProcessing && styles.disabledButton]}
              onPress={evaluateChoices}
              disabled={isProcessing}
              activeOpacity={0.7}
            >
              <Text style={styles.buttonText}>
                {isProcessing ? 'Evaluating...' : 'Evaluate & Choose'}
              </Text>
            </TouchableOpacity>
          )}
          
          {/* Quick Mode Button */}
          <TouchableOpacity
            style={[styles.quickModeButton, isProcessing && styles.disabledButton]}
            onPress={generateQuickChoice}
            disabled={isProcessing}
            activeOpacity={0.7}
          >
            <MaterialIcons name="flash-on" size={20} color="white" />
            <Text style={styles.quickModeText}>
              {isProcessing ? 'Generating...' : 'Quick Choice'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.resetButton}
            onPress={resetApp}
            activeOpacity={0.7}
          >
            <Text style={styles.resetButtonText}>Reset</Text>
          </TouchableOpacity>
        </View>

        {/* Result Section */}
        {showResult && selectedChoice && (
          <View style={[styles.resultSection, actualDarkMode && styles.resultSectionDark]}>
            <Text style={[styles.resultTitle, actualDarkMode && styles.resultTitleDark]}>🎉 Your Choice:</Text>
            <Text style={[styles.resultText, actualDarkMode && styles.resultTextDark]}>{selectedChoice}</Text>
            <Text style={[styles.resultSubtext, actualDarkMode && styles.resultSubtextDark]}>
              Selected from {choices.filter(c => c.isGood).length} good options
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  containerDark: {
    flex: 1,
    backgroundColor: '#121212',
  },
  header: {
    backgroundColor: '#2196F3',
    paddingTop: Platform.OS === 'ios' ? 25 : 20,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerDark: {
    backgroundColor: '#1a1a1a',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
  },

  darkModeToggle: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  title: {
    fontSize: 32,
    fontFamily: 'RampartOne',
    color: 'white',
    marginBottom: 5,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    fontFamily: 'RampartOne',
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  contentDark: {
    flex: 1,
    padding: 20,
    backgroundColor: '#121212',
  },
  inputSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
    color: '#333',
  },
  sectionTitleDark: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
    color: '#ffffff',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  inputDark: {
    flex: 1,
    backgroundColor: '#2a2a2a',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#444',
    color: '#ffffff',
  },
  addButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    padding: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  randomActivityButton: {
    backgroundColor: '#FF9800',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  randomActivityText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  choicesSection: {
    marginBottom: 20,
  },
  choiceItem: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#eee',
  },
  choiceItemDark: {
    backgroundColor: '#2a2a2a',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#444',
  },
  choiceContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  choiceNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    marginRight: 10,
    minWidth: 25,
  },
  choiceNumberDark: {
    fontSize: 16,
    fontWeight: '600',
    color: '#aaa',
    marginRight: 10,
    minWidth: 25,
  },
  choiceText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  choiceTextDark: {
    flex: 1,
    fontSize: 16,
    color: '#ffffff',
  },
  statusIcon: {
    marginLeft: 10,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 10,
  },
  confidenceText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 5,
  },
  removeButton: {
    padding: 5,
  },
  actionSection: {
    marginBottom: 20,
  },
  evaluateButton: {
    backgroundColor: '#2196F3',
    borderRadius: 8,
    paddingVertical: 15,
    alignItems: 'center',
    marginBottom: 10,
  },
  quickModeButton: {
    backgroundColor: '#FF9800',
    borderRadius: 8,
    paddingVertical: 15,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  quickModeText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  resetButton: {
    backgroundColor: 'transparent',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  resetButtonText: {
    color: '#666',
    fontSize: 16,
  },
  resultSection: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#4CAF50',
  },
  resultSectionDark: {
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#4CAF50',
  },
  resultTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  resultTitleDark: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 10,
  },
  resultText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
    textAlign: 'center',
    marginBottom: 10,
  },
  resultTextDark: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#66BB6A',
    textAlign: 'center',
    marginBottom: 10,
  },
  resultSubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  resultSubtextDark: {
    fontSize: 14,
    color: '#aaa',
    textAlign: 'center',
  },
});
