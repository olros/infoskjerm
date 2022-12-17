import { CacheProvider } from '@emotion/react';
import createEmotionServer from '@emotion/server/create-instance';
import { CssBaseline, CssVarsProvider } from '@mui/joy';
import type { EntryContext } from '@remix-run/node';
import { RemixServer } from '@remix-run/react';
import { theme } from '~/theme';
import { renderToString } from 'react-dom/server';

import { createEmotionCache } from '~/styles/createEmotionCache';
import ServerStyleContext from '~/styles/server.context';

export default function handleRequest(request: Request, responseStatusCode: number, responseHeaders: Headers, remixContext: EntryContext) {
  const cache = createEmotionCache();
  const { extractCriticalToChunks } = createEmotionServer(cache);

  const html = renderToString(
    <ServerStyleContext.Provider value={null}>
      <CacheProvider value={cache}>
        <CssVarsProvider defaultColorScheme='dark' defaultMode='dark' theme={theme}>
          <CssBaseline />
          <RemixServer context={remixContext} url={request.url} />
        </CssVarsProvider>
      </CacheProvider>
    </ServerStyleContext.Provider>,
  );

  const chunks = extractCriticalToChunks(html);

  const markup = renderToString(
    <ServerStyleContext.Provider value={chunks.styles}>
      <CacheProvider value={cache}>
        <CssVarsProvider defaultColorScheme='dark' defaultMode='dark' theme={theme}>
          <CssBaseline />
          <RemixServer context={remixContext} url={request.url} />
        </CssVarsProvider>
      </CacheProvider>
    </ServerStyleContext.Provider>,
  );

  responseHeaders.set('Content-Type', 'text/html');

  return new Response(`<!DOCTYPE html>${markup}`, {
    status: responseStatusCode,
    headers: responseHeaders,
  });
}