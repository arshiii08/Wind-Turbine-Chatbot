import { Chat, Message } from '../types/chat';

export const generateChatTitle = (firstMessage: string): string => {
  const words = firstMessage.trim().split(' ').slice(0, 6);
  return words.join(' ') + (firstMessage.split(' ').length > 6 ? '...' : '');
};

export const generateBotResponse = (userMessage: string): string => {
  const responses = [
    `Based on your question about "${userMessage.slice(0, 50)}...", here are some potential **wind turbine fault indicators**:

## Common Issues:
- **Vibration anomalies** - Check bearing conditions
- **Temperature fluctuations** - Monitor gearbox and generator
- **Power output variations** - Inspect blade pitch systems

### Recommended Actions:
1. Review recent maintenance logs
2. Check sensor calibration
3. Analyze historical performance data

Would you like me to elaborate on any specific component?`,

    `I understand you're investigating **turbine performance issues**. Here's my analysis:

## Diagnostic Approach:
- **SCADA data review** - Look for pattern anomalies
- **Vibration analysis** - Focus on drivetrain components
- **Electrical systems** - Check grid connection stability

### Key Metrics to Monitor:
1. **RPM variations** beyond normal range
2. **Power curve deviations** from manufacturer specs
3. **Oil pressure** and temperature readings

*This analysis is based on industry best practices for wind turbine diagnostics.*`,

    `For **turbine fault diagnosis**, I recommend this systematic approach:

## Primary Checks:
- **Blade inspection** - Look for damage or ice buildup
- **Yaw system** - Verify proper wind tracking
- **Control system** - Check for error codes

### Advanced Diagnostics:
1. **Spectrum analysis** of vibration data
2. **Thermal imaging** of electrical components
3. **Oil analysis** for contamination

**Warning:** Always follow lockout/tagout procedures before maintenance.

Need more specific guidance on any of these areas?`
  ];

  return responses[Math.floor(Math.random() * responses.length)];
};

export const formatMessageTime = (date: Date): string => {
  return new Intl.DateTimeFormat('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  }).format(date);
};

export const formatChatTime = (date: Date): string => {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric'
  }).format(date);
};