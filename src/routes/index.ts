import { Router } from 'express';
import { authLimiter } from '../middleware/rateLimiter';
import * as clock from '../controllers/clockController';
import * as records from '../controllers/timeRecordController';
import * as report from '../controllers/reportController';
import * as config from '../controllers/workConfigController';
import * as users from '../controllers/userController';
import { body, query, param } from 'express-validator';
import { authenticate, requireAdmin } from '../middleware/authenticate';
import { handleLogin } from '../controllers/authController';

const router = Router();

// ─── Authentication ───────────────────────────────────────────────────────────────
router.post(
  '/auth/login',
  authLimiter,
  [
    body('email').isEmail().withMessage('valid email is required'),
    body('password').notEmpty().withMessage('password is required'),
  ],
  handleLogin
);

// ─── Health ───────────────────────────────────────────────────────────────────
router.get('/health', (_, res) => res.json({ status: 'ok', timestamp: new Date() }));

// ─── All routes below require authentication ─────────────────────────────────────────
router.use(authenticate);

// ─── Users ────────────────────────────────────────────────────────────────────
router.post(
  '/users',
  [
    body('name').trim().notEmpty().withMessage('name is required'),
    body('email').isEmail().withMessage('valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('password must be at least 6 characters'),
    body('role').optional().isIn(['admin', 'employee']).withMessage('role must be admin or employee'),
  ],
  users.createUser
);
router.get('/users', users.listUsers);
router.get('/users/:id', users.getUser);
router.patch(
  '/users/:id',
  [
    body('name').optional().trim().notEmpty().withMessage('name cannot be empty'),
    body('email').optional().isEmail().withMessage('valid email is required'),
  ],
  users.updateUser
);
router.delete('/users/:id', users.deleteUser);

// ─── Clock ────────────────────────────────────────────────────────────────────
router.post(
  '/clock/in',
  [
    body('userId').notEmpty().withMessage('userId is required'),
    body('notes').optional().isString(),
  ],
  clock.handleClockIn
);
router.post(
  '/clock/out',
  [
    body('userId').notEmpty().withMessage('userId is required'),
    body('notes').optional().isString(),
  ],
  clock.handleClockOut
);
router.get('/clock/status/:userId', clock.handleClockStatus);

// ─── Time Records (CRUD) ──────────────────────────────────────────────────────
router.post(
  '/time-records',
  [
    body('userId').notEmpty().withMessage('userId is required'),
    body('clockIn').isISO8601().withMessage('clockIn must be ISO 8601 datetime'),
    body('clockOut').optional().isISO8601().withMessage('clockOut must be ISO 8601 datetime'),
    body('notes').optional().isString(),
  ],
  records.createRecord
);
router.get(
  '/time-records',
  [
    query('from').optional().isDate().withMessage('from must be YYYY-MM-DD'),
    query('to').optional().isDate().withMessage('to must be YYYY-MM-DD'),
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
  ],
  records.listRecords
);
router.get('/time-records/:id', records.getRecord);
router.patch(
  '/time-records/:id',
  [
    body('clockIn').optional().isISO8601().withMessage('clockIn must be ISO 8601 datetime'),
    body('clockOut').optional({ nullable: true }).isISO8601().withMessage('clockOut must be ISO 8601 datetime'),
    body('notes').optional({ nullable: true }).isString(),
  ],
  records.updateRecord
);
router.delete('/time-records/:id', records.deleteRecord);

// ─── Reports ──────────────────────────────────────────────────────────────────
router.get(
  '/reports',
  [
    query('userId').notEmpty().withMessage('userId is required'),
    query('from').isDate().withMessage('from (YYYY-MM-DD) is required'),
    query('to').isDate().withMessage('to (YYYY-MM-DD) is required'),
  ],
  report.getReport
);

// ─── Work Config ──────────────────────────────────────────────────────────────
router.get('/config', config.getConfig);
router.put(
  '/config', requireAdmin,
  [
    body('normalHoursPerDay').isInt({ min: 1, max: 24 }).withMessage('normalHoursPerDay must be 1–24'),
    body('workingDaysOfWeek')
      .isArray({ min: 1 })
      .withMessage('workingDaysOfWeek must be a non-empty array')
      .custom((arr: unknown[]) => arr.every((d) => Number.isInteger(d) && (d as number) >= 0 && (d as number) <= 6))
      .withMessage('Each day must be 0 (Sun) through 6 (Sat)'),
  ],
  config.updateConfig
);

// ─── Calendar Overrides ───────────────────────────────────────────────────────
router.get('/calendar-overrides', config.listOverrides);
router.put(
  '/calendar-overrides', requireAdmin,
  [
    body('date').isDate().withMessage('date must be YYYY-MM-DD'),
    body('isWorkingDay').isBoolean().withMessage('isWorkingDay must be boolean'),
    body('description').optional().isString(),
  ],
  config.upsertOverride
);
router.delete(
  '/calendar-overrides/:date', requireAdmin,
  [param('date').isDate().withMessage('date must be YYYY-MM-DD')],
  config.deleteOverride
);

export default router;
