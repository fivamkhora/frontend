const assert = require('node:assert/strict');
const { describe, it } = require('node:test');

const app = require('./app');

function startTestServer() {
  return new Promise((resolve) => {
    const server = app.listen(0, () => {
      const { port } = server.address();
      resolve({ server, baseUrl: `http://127.0.0.1:${port}` });
    });
  });
}

describe('app', () => {
  it('returns construction page on root route', async () => {
    const { server, baseUrl } = await startTestServer();

    try {
      const response = await fetch(`${baseUrl}/`);
      const body = await response.text();

      assert.equal(response.status, 200);
      assert.match(response.headers.get('content-type'), /text\/html/);
      assert.match(body, /Em construcao/);
      assert.match(body, /\/styles\.css/);
    } finally {
      server.close();
    }
  });

  it('serves basic stylesheet', async () => {
    const { server, baseUrl } = await startTestServer();

    try {
      const response = await fetch(`${baseUrl}/styles.css`);
      const body = await response.text();

      assert.equal(response.status, 200);
      assert.match(response.headers.get('content-type'), /text\/css/);
      assert.match(body, /\.page/);
    } finally {
      server.close();
    }
  });

  it('returns health status', async () => {
    const { server, baseUrl } = await startTestServer();

    try {
      const response = await fetch(`${baseUrl}/health`);
      const body = await response.json();

      assert.equal(response.status, 200);
      assert.deepEqual(body, { status: 'ok' });
    } finally {
      server.close();
    }
  });

  it('respects forwarded protocol from TLS offload proxy', async () => {
    const { server, baseUrl } = await startTestServer();

    try {
      const response = await fetch(`${baseUrl}/request-info`, {
        headers: {
          'x-forwarded-for': '203.0.113.10',
          'x-forwarded-proto': 'https',
        },
      });
      const body = await response.json();

      assert.equal(response.status, 200);
      assert.equal(body.protocol, 'https');
      assert.equal(body.secure, true);
      assert.equal(body.ip, '203.0.113.10');
    } finally {
      server.close();
    }
  });
});
