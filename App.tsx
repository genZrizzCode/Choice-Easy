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
    <View style={[styles.container, { pointerEvents: 'auto' }]}>
      <StatusBar style="auto" />
      
      <View style={styles.header}>
        <Text style={styles.title}>ChoiceEasy</Text>
        <Text style={styles.subtitle}>AI-Powered Decision Maker</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Input Section */}
        <View style={styles.inputSection}>
          <Text style={styles.sectionTitle}>Add Your Choices ({choices.length}/7)</Text>
          
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={currentInput}
              onChangeText={setCurrentInput}
              placeholder="Enter a choice..."
              placeholderTextColor="#999"
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
        </View>

        {/* Choices List */}
        {choices.length > 0 && (
          <View style={styles.choicesSection}>
            <Text style={styles.sectionTitle}>Your Choices</Text>
            {choices.map((choice, index) => (
              <View key={choice.id} style={styles.choiceItem}>
                <View style={styles.choiceContent}>
                  <Text style={styles.choiceNumber}>{index + 1}.</Text>
                  <Text style={styles.choiceText}>{choice.text}</Text>
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
        {choices.length >= 2 && (
          <View style={styles.actionSection}>
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
            
            <TouchableOpacity
              style={styles.resetButton}
              onPress={resetApp}
              activeOpacity={0.7}
            >
              <Text style={styles.resetButtonText}>Reset</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Result Section */}
        {showResult && selectedChoice && (
          <View style={styles.resultSection}>
            <Text style={styles.resultTitle}>🎉 Your Choice:</Text>
            <Text style={styles.resultText}>{selectedChoice}</Text>
            <Text style={styles.resultSubtext}>
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
  header: {
    backgroundColor: '#2196F3',
    paddingTop: Platform.OS === 'ios' ? 25 : 20,
    paddingBottom: 20,
    paddingHorizontal: 20,
    alignItems: 'center',
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
  inputSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
    color: '#333',
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
  choiceText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
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
  resultTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  resultText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
    textAlign: 'center',
    marginBottom: 10,
  },
  resultSubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});
