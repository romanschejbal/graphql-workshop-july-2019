import fetch from 'isomorphic-fetch';
import Dataloader from 'dataloader';

export default function createContext() {
  const getter = new Dataloader((urls: string[]) => {
    return Promise.all(
      urls.map(async url => {
        const response = await fetch(url);
        if (response.status > 300) {
          console.error(await response.text());
          return null;
        }
        return response.json();
      })
    );
  });

  return { getter };
}
