import { Request } from 'express';
import { ParsedQs } from 'qs';

/**
 * Safely extracts a string value from a query parameter
 */
export function getStringQueryParam(req: Request, paramName: string, defaultValue?: string): string | undefined {
  const param = req.query[paramName];
  if (Array.isArray(param)) {
    return typeof param[0] === 'string' ? param[0] : defaultValue;
  } else if (typeof param === 'string') {
    return param;
  }
  return defaultValue;
}

/**
 * Safely extracts a number value from a query parameter
 */
export function getNumberQueryParam(req: Request, paramName: string, defaultValue: number = 0): number {
  const stringValue = getStringQueryParam(req, paramName);
  if (stringValue === undefined) {
    return defaultValue;
  }
  const numValue = parseInt(stringValue, 10);
  return isNaN(numValue) ? defaultValue : numValue;
}