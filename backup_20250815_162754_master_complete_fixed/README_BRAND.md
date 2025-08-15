# ParcelAce Brand Guidelines

## Overview

This document explains how to manage ParcelAce's brand voice and AI responses.

## Files

### 1. `BRAND_GUIDELINES.md`
- **Purpose**: Main brand guidelines document (human-readable)
- **Use**: Reference for brand voice, tone, and messaging
- **How to edit**: Simply open and modify the markdown file
- **Contains**: Company info, voice guidelines, fallback responses, examples

### 2. `src/config/brandConfig.ts`
- **Purpose**: Technical configuration for AI system
- **Use**: Provides data to ChatGPT service
- **How to edit**: Modify the JavaScript constants
- **Contains**: Brand info, fallback responses, helper functions

## How to Modify Brand Voice

### For Non-Technical Users
1. Open `BRAND_GUIDELINES.md`
2. Edit any section (tone, personality, responses, etc.)
3. Save the file
4. The changes will be reflected in AI responses

### For Technical Users
1. Edit `BRAND_GUIDELINES.md` for documentation
2. Edit `src/config/brandConfig.ts` for AI behavior
3. Update fallback responses in both files
4. Test changes in the AI chat

## Key Sections to Modify

### Brand Voice
- **Tone**: How the AI should sound
- **Personality**: Character traits
- **Language**: Communication style

### Fallback Responses
- **Greeting**: Welcome messages
- **Help**: Assistance messages
- **Error**: Problem messages
- **Analytics**: Data-related responses
- **Wallet**: Expense-related responses
- **Shipping**: Logistics responses

### Quick Responses
- **Analytics**: Common analytics queries
- **Wallet**: Common wallet queries
- **Optimization**: Common optimization queries

## Testing Changes

1. Start the development server: `npm run dev`
2. Go to: `http://localhost:8080/ai`
3. Test different queries to see brand voice in action
4. Check fallback responses when AI is not configured

## Best Practices

- Keep responses concise (under 200 words)
- Use clear, actionable language
- Be professional but friendly
- Provide specific, helpful information
- Avoid technical jargon unless necessary
- Test responses with real users

## Contact

For questions about brand guidelines, contact the development team. 