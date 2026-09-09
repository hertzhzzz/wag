jest.mock('child_process', () => ({
  execSync: jest.fn(),
}));

import { execSync } from 'child_process';
import { notify, logToFile } from './notify';
import * as fs from 'fs';

const mockExecSync = execSync as jest.MockedFunction<typeof execSync>;

describe('notify', () => {
  const testLogPath = '/tmp/seo-pipeline-test.log';

  beforeEach(() => {
    mockExecSync.mockReset();
    mockExecSync.mockReturnValue(Buffer.from(''));
    if (fs.existsSync(testLogPath)) {
      fs.unlinkSync(testLogPath);
    }
  });

  it('should send macOS notification via osascript (mocked, no real popup)', async () => {
    await notify('Test Title', 'Test message');

    expect(mockExecSync).toHaveBeenCalledTimes(1);
    const [command, options] = mockExecSync.mock.calls[0];
    expect(command).toContain('osascript');
    expect(command).toContain('display notification "Test message"');
    expect(command).toContain('with title "Test Title"');
    expect(options).toEqual({ stdio: 'ignore' });
  });

  it('should escape quotes in title and message', async () => {
    await notify('Say "hi"', 'Body "quoted"');

    expect(mockExecSync).toHaveBeenCalledTimes(1);
    const command = mockExecSync.mock.calls[0][0] as string;
    expect(command).toContain('display notification "Body \\"quoted\\""');
    expect(command).toContain('with title "Say \\"hi\\""');
  });

  it('should not throw when osascript fails', async () => {
    mockExecSync.mockImplementation(() => {
      throw new Error('osascript failed');
    });
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});

    await expect(notify('Title', 'Message')).resolves.toBeUndefined();
    expect(warn).toHaveBeenCalled();

    warn.mockRestore();
  });

  it('should write log entry to file', async () => {
    await logToFile(testLogPath, 'Test log entry');
    const content = fs.readFileSync(testLogPath, 'utf-8');
    expect(content).toContain('Test log entry');
  });
});
