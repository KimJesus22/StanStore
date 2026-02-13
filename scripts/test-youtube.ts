import { searchMusicVideo } from './src/lib/youtube';

async function test() {
    const artists = [
        { name: 'BTS', song: 'ON' },
        { name: 'ENHYPEN', song: 'Sweet Venom' },
    ];

    for (const artist of artists) {
        console.log(`Searching for ${artist.name} - ${artist.song}...`);
        try {
            const results = await searchMusicVideo(artist.name, artist.song);
            if (results.length > 0) {
                console.log(`Top result for ${artist.name}: ${results[0].id} - ${results[0].title}`);
            } else {
                console.log(`No results for ${artist.name}`);
            }
        } catch (e) {
            console.error(`Error searching for ${artist.name}:`, e);
        }
    }
}

test();
