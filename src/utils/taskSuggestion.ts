
import taskSuggestions from '@/data/taskSuggestions.json';

export const suggestTask = async (): Promise<string> => {
  try {
    // Get a random suggestion from the JSON array
    const randomIndex = Math.floor(Math.random() * taskSuggestions.length);
    const suggestion = taskSuggestions[randomIndex];
    
    if (!suggestion) {
      throw new Error("No suggestion available");
    }
    
    return suggestion;
  } catch (error) {
    console.error("Error suggesting task:", error);
    return "Drink a glass of water"; // Default fallback suggestion
  }
};
