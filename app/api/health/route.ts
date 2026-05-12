import { NextResponse } from 'next/server';

/**
 * Health Check Endpoint
 * 
 * Verifies that all required environment variables are configured
 * Useful for debugging production deployments
 */
export async function GET() {
  const config = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    checks: {
      nextAuth: {
        hasUrl: !!process.env.NEXTAUTH_URL,
        hasSecret: !!process.env.NEXTAUTH_SECRET,
        url: process.env.NEXTAUTH_URL || 'NOT_SET',
      },
      database: {
        hasUrl: !!process.env.DATABASE_URL,
        // Don't expose actual URL for security
      },
      ai: {
        provider: process.env.AI_PROVIDER || 'NOT_SET',
        hasOpenAIKey: !!process.env.OPENAI_API_KEY,
        hasAnthropicKey: !!process.env.ANTHROPIC_API_KEY,
      },
      oauth: {
        hasGoogleClientId: !!process.env.GOOGLE_CLIENT_ID,
        hasGoogleClientSecret: !!process.env.GOOGLE_CLIENT_SECRET,
        hasGitHubClientId: !!process.env.GITHUB_CLIENT_ID,
        hasGitHubClientSecret: !!process.env.GITHUB_CLIENT_SECRET,
      },
      cache: {
        hasRedisUrl: !!process.env.REDIS_URL,
        hasRedisToken: !!process.env.REDIS_TOKEN,
      },
    },
  };

  // Calculate overall health
  const allChecks = [
    config.checks.nextAuth.hasUrl,
    config.checks.nextAuth.hasSecret,
    config.checks.database.hasUrl,
    config.checks.ai.provider !== 'NOT_SET',
    (config.checks.ai.hasOpenAIKey || config.checks.ai.hasAnthropicKey),
    config.checks.oauth.hasGoogleClientId,
    config.checks.oauth.hasGoogleClientSecret,
    config.checks.oauth.hasGitHubClientId,
    config.checks.oauth.hasGitHubClientSecret,
  ];

  const healthyCount = allChecks.filter(Boolean).length;
  const totalCount = allChecks.length;
  const healthPercentage = Math.round((healthyCount / totalCount) * 100);

  return NextResponse.json({
    ...config,
    health: {
      percentage: healthPercentage,
      healthy: healthyCount,
      total: totalCount,
      status: healthPercentage === 100 ? 'healthy' : healthPercentage >= 70 ? 'degraded' : 'unhealthy',
    },
  });
}
