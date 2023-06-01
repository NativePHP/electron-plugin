import startAPIServer, { APIProcess } from "../../src/server/api";
import axios from "axios";

let apiServer: APIProcess;

jest.mock('electron', () => ({
  clipboard: {
    readText: jest.fn(() => 'clipboard text'),
    readHTML: jest.fn(() => 'clipboard html'),
    readImage: jest.fn(() => ({
      isEmpty: jest.fn(() => true),
      toDataURL: jest.fn(() => 'clipboard image'),
    })),
  }
}));
describe('API test', () => {
  beforeEach(async () => {
    apiServer = await startAPIServer('randomSecret')

    axios.defaults.baseURL = `http://localhost:${apiServer.port}/api`;
    axios.defaults.headers.common['x-nativephp-secret'] = 'randomSecret';
  })

  afterEach(done => {
    apiServer.server.close(done);
  });

  it('can get clipboard contents as text', async () => {
    const response = await axios.get('/clipboard/text');
    expect(response.data.text).toBe('clipboard text');
  });

  it('can get clipboard contents as HTML', async () => {
    const response = await axios.get('/clipboard/html');
    expect(response.data.html).toBe('clipboard html');
  });

  it('can get clipboard contents as image', async () => {
    const response = await axios.get('/clipboard/image');
    expect(response.data.image).toBe(null);
  });

});
