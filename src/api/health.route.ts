import { Router, Request, Response } from 'express';
import { redisService } from '../services/redis.service';
import { pool } from '../config/database';

const router = Router();

// Health check endpoint
router.get('/', async (req: Request, res: Response) => {
  try {
    // Check database connectivity
    let dbHealthy = false;
    try {
      const connection = await pool.getConnection();
      await connection.query('SELECT 1');
      connection.release();
      dbHealthy = true;
    } catch (error) {
      console.error('Database health check failed:', error);
      dbHealthy = false;
    }

    // Check Redis connectivity
    const redisEnabled = redisService.isEnabled();
    let redisHealthy = false;
    
    if (redisEnabled) {
      try {
        const client = redisService.getClient();
        if (client) {
          await client.ping();
          redisHealthy = true;
        }
      } catch (error) {
        console.error('Redis health check failed:', error);
        redisHealthy = false;
      }
    }

    // Overall health status
    const overallHealthy = dbHealthy;

    res.status(200).json({
      status: overallHealthy ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      services: {
        database: {
          status: dbHealthy ? 'healthy' : 'unhealthy',
          message: dbHealthy ? 'Database connection successful' : 'Database connection failed'
        },
        redis: {
          enabled: redisEnabled,
          status: redisHealthy ? 'healthy' : 'unhealthy',
          message: redisEnabled 
            ? (redisHealthy ? 'Redis connection successful' : 'Redis connection failed') 
            : 'Redis is disabled'
        }
      },
      features: {
        caching: redisEnabled && redisHealthy,
        database_access: dbHealthy
      }
    });
  } catch (error) {
    console.error('Health check error:', error);
    res.status(500).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: 'Health check failed',
      services: {
        database: {
          status: 'unknown',
          message: 'Could not determine database status'
        },
        redis: {
          status: 'unknown',
          message: 'Could not determine Redis status'
        }
      }
    });
  }
});

// Detailed health check with Redis stats
router.get('/details', async (req: Request, res: Response) => {
  try {
    // Check database connectivity
    let dbHealthy = false;
    let dbDetails = {};
    try {
      const connection = await pool.getConnection();
      const [result] = await connection.query('SELECT 1 as test');
      connection.release();
      dbHealthy = true;
      dbDetails = {
        connected: true,
        test_query: result
      };
    } catch (error) {
      console.error('Database health check failed:', error);
      dbHealthy = false;
      dbDetails = {
        connected: false,
        error: (error as Error).message
      };
    }

    // Check Redis connectivity and get stats
    const redisEnabled = redisService.isEnabled();
    let redisHealthy = false;
    let redisStats = null;
    
    if (redisEnabled) {
      try {
        const client = redisService.getClient();
        if (client) {
          await client.ping();
          redisHealthy = true;
          
          // Get Redis info
          try {
            const info = await client.info();
            redisStats = {
              version: info.match(/redis_version:(.*)/)?.[1] || 'unknown',
              connected_clients: info.match(/connected_clients:(.*)/)?.[1] || 'unknown',
              used_memory: info.match(/used_memory_human:(.*)/)?.[1] || 'unknown',
              uptime_in_seconds: info.match(/uptime_in_seconds:(.*)/)?.[1] || 'unknown',
            };
          } catch (infoError) {
            console.error('Could not get Redis info:', infoError);
          }
        }
      } catch (error) {
        console.error('Redis health check failed:', error);
        redisHealthy = false;
      }
    }

    res.status(200).json({
      status: (dbHealthy && (!redisEnabled || redisHealthy)) ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      details: {
        database: {
          status: dbHealthy ? 'healthy' : 'unhealthy',
          details: dbDetails
        },
        redis: {
          enabled: redisEnabled,
          status: redisHealthy ? 'healthy' : 'unhealthy',
          details: redisStats
        }
      }
    });
  } catch (error) {
    console.error('Detailed health check error:', error);
    res.status(500).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      error: 'Detailed health check failed'
    });
  }
});

export default router;