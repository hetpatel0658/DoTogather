import openai
from typing import Dict, List, Any
import json
import logging
from ..core.config import settings

logger = logging.getLogger(__name__)

class AIService:
    def __init__(self):
        openai.api_key = settings.openai_api_key
        self.client = openai.OpenAI(api_key=settings.openai_api_key)

    async def extract_task_from_text(self, text: str) -> Dict[str, Any]:
        """Extract task information from natural language text"""
        try:
            prompt = f"""
            Extract task information from the following text: "{text}"
            
            Return a JSON object with the following structure:
            {{
                "task_name": "string (required)",
                "description": "string (optional)",
                "priority": "low|medium|high (default: medium)",
                "category": "work|personal|health|learning|social|other (default: other)",
                "points": "integer (default: 10)"
            }}
            
            If no clear task can be identified, return {{"task_name": null}}.
            
            Examples:
            - "I need to buy groceries" -> {{"task_name": "Buy groceries", "category": "personal"}}
            - "Call mom tomorrow" -> {{"task_name": "Call mom", "category": "personal"}}
            - "Finish the project report by Friday" -> {{"task_name": "Finish project report", "category": "work", "priority": "high"}}
            """
            
            response = self.client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": "You are a helpful assistant that extracts task information from natural language."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.3,
                max_tokens=200
            )
            
            result = response.choices[0].message.content.strip()
            
            # Parse JSON response
            try:
                task_info = json.loads(result)
                return task_info
            except json.JSONDecodeError:
                logger.error(f"Failed to parse AI response as JSON: {result}")
                return {"task_name": None}
                
        except Exception as e:
            logger.error(f"Error extracting task from text: {str(e)}")
            return {"task_name": None}

    async def suggest_tasks(self, context: str, user_context: Dict[str, Any]) -> Dict[str, Any]:
        """Generate task suggestions based on context and user history"""
        try:
            recent_tasks = ", ".join(user_context.get("recent_tasks", []))
            
            prompt = f"""
            Based on the following context and user information, suggest 5 relevant tasks:
            
            Context: "{context}"
            User Level: {user_context.get("user_level", 1)}
            Current Streak: {user_context.get("current_streak", 0)}
            Recent Tasks: {recent_tasks}
            
            Return a JSON object with:
            {{
                "tasks": ["task1", "task2", "task3", "task4", "task5"],
                "reasoning": "Brief explanation of why these tasks were suggested"
            }}
            
            Make sure tasks are:
            1. Relevant to the context
            2. Appropriate for the user's level
            3. Diverse in categories
            4. Actionable and specific
            5. Not duplicating recent tasks
            """
            
            response = self.client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": "You are a productivity coach that suggests personalized tasks."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.7,
                max_tokens=300
            )
            
            result = response.choices[0].message.content.strip()
            
            try:
                suggestions = json.loads(result)
                return suggestions
            except json.JSONDecodeError:
                logger.error(f"Failed to parse AI suggestions as JSON: {result}")
                return {
                    "tasks": ["Review your goals", "Plan tomorrow's priorities", "Take a short break"],
                    "reasoning": "Default suggestions due to parsing error"
                }
                
        except Exception as e:
            logger.error(f"Error generating task suggestions: {str(e)}")
            return {
                "tasks": ["Review your goals", "Plan tomorrow's priorities", "Take a short break"],
                "reasoning": "Default suggestions due to error"
            }

    async def chat_response(self, user_message: str, user_id: int) -> str:
        """Generate conversational response for voice chat"""
        try:
            prompt = f"""
            You are a friendly AI assistant for a task management app called DoTogather. 
            The user (ID: {user_id}) said: "{user_message}"
            
            Respond in a helpful, encouraging way. If they're asking about tasks:
            - Help them create, modify, or organize tasks
            - Provide motivation and productivity tips
            - Ask clarifying questions if needed
            
            Keep responses concise (1-2 sentences) and conversational.
            """
            
            response = self.client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": "You are a helpful, encouraging AI assistant for task management."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.7,
                max_tokens=150
            )
            
            return response.choices[0].message.content.strip()
            
        except Exception as e:
            logger.error(f"Error generating chat response: {str(e)}")
            return "I'm sorry, I'm having trouble understanding right now. Could you try again?"

    async def analyze_productivity_patterns(self, tasks: List[Dict], user_data: Dict) -> Dict[str, Any]:
        """Analyze user's productivity patterns and provide insights"""
        try:
            tasks_summary = []
            for task in tasks[-20:]:  # Last 20 tasks
                tasks_summary.append({
                    "name": task.get("name", ""),
                    "completed": task.get("is_completed", False),
                    "category": task.get("category", "other"),
                    "priority": task.get("priority", "medium")
                })
            
            prompt = f"""
            Analyze the following productivity data and provide insights:
            
            User Data:
            - Current Streak: {user_data.get("current_streak", 0)}
            - Total Points: {user_data.get("points", 0)}
            - Level: {user_data.get("level", 1)}
            
            Recent Tasks: {json.dumps(tasks_summary)}
            
            Return a JSON object with:
            {{
                "productivity_score": "integer (1-100)",
                "strengths": ["strength1", "strength2"],
                "areas_for_improvement": ["area1", "area2"],
                "recommendations": ["recommendation1", "recommendation2"],
                "insights": "Brief overall insight"
            }}
            """
            
            response = self.client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": "You are a productivity analyst providing insights based on task completion data."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.5,
                max_tokens=400
            )
            
            result = response.choices[0].message.content.strip()
            
            try:
                analysis = json.loads(result)
                return analysis
            except json.JSONDecodeError:
                logger.error(f"Failed to parse productivity analysis as JSON: {result}")
                return {
                    "productivity_score": 75,
                    "strengths": ["Consistent task creation"],
                    "areas_for_improvement": ["Task completion rate"],
                    "recommendations": ["Set smaller, more achievable goals"],
                    "insights": "Keep up the good work!"
                }
                
        except Exception as e:
            logger.error(f"Error analyzing productivity patterns: {str(e)}")
            return {
                "productivity_score": 75,
                "strengths": ["Consistent effort"],
                "areas_for_improvement": ["Data analysis"],
                "recommendations": ["Continue tracking your progress"],
                "insights": "Keep building your productivity habits!"
            }