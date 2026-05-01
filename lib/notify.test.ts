import { notify, logToFile } from './notify';
import * as fs from 'fs';
import * as path from 'path';

describe('notify', () => {
  const testLogPath = '/tmp/seo-pipeline-test.log';

  beforeEach(() => {
    if (fs.existsSync(testLogPath)) {
      fs.unlinkSync(testLogPath);
    }
  });

  it('should send macOS notification', async () => {
    await notify('Test Title', 'Test message');
    // Verify no error thrown
  });

  it('should write log entry to file', async () => {
    await logToFile(testLogPath, 'Test log entry');
    const content = fs.readFileSync(testLogPath, 'utf-8');
    expect(content).toContain('Test log entry');
  });
});