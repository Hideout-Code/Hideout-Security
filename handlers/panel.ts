import fetch from 'node-fetch';
import log from './logger.ts';

export async function panelAPI(type: string, server: string, cmd?: string) {
  let url = `http://172.84.76.7/api/client/servers/${server}`;
  let headerList = {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${process.env.C_PTAPI_KEY}`,
  };

  switch (type) {
    case 'info':
      try {
        let responseR = await fetch(url, {
          method: 'GET',
          headers: headerList,
        });
        let response = await responseR.json();
        return response;
      } catch (error) {
        log.error(error);
        return null;
      }
    case 'usage':
      url = `${url}/resources`;
      try {
        let responseR = await fetch(url, {
          method: 'GET',
          headers: headerList,
        });
        let response = await responseR.json();
        return response;
      } catch (error) {
        log.error(error);
        return null;
      }
    case 'command':
      url = `${url}/command`;
      let bodyCont = { command: cmd };
      try {
        await fetch(url, {
          method: 'POST',
          headers: headerList,
          body: JSON.stringify(bodyCont),
        });
        return true;
      } catch (error) {
        log.error(error);
        return null;
      }
    case 'power':
      url = `${url}/power`;
      let bodyCont2 = { signal: cmd };
      try {
        await fetch(url, {
          method: 'POST',
          headers: headerList,
          body: JSON.stringify(bodyCont2),
        });
        return true;
      } catch (error) {
        log.error(error);
        return null;
      }
    default:
      return null;
  }
}