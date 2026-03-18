interface RateLimitStore {
  count: number;
  resetTime: number;
}

const rateLimitMap = new Map<string, RateLimitStore>();

export function rateLimit(ip: string, limit: number = 100, windowMs: number = 60000) {
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  if (!record || now > record.resetTime) {
    const newRecord = { count: 1, resetTime: now + windowMs };
    rateLimitMap.set(ip, newRecord);
    return { success: true, remaining: limit - 1, reset: newRecord.resetTime };
  }

  record.count++;
  
  if (record.count > limit) {
    return { success: false, remaining: 0, reset: record.resetTime };
  }

  return { success: true, remaining: limit - record.count, reset: record.resetTime };
}
