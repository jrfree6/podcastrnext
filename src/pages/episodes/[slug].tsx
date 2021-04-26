import { GetStaticPaths, GetStaticProps } from 'next';
import Image from 'next/image';
import Head from 'next/head';

import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import api from '../../services/api';
import { convertDurationToTimeString } from '../../ultils';
import styles from './episodes.module.scss';
import Link from 'next/link';
import { usePlayer } from '../../contexts/PlayerContext';

type Episode = {
    id: string,
    title: string,
    thumbnail : string,
    description: string,
    members: string,
    duration: number,
    durationAsString: string,
    publishedAt: string,
    url: string

}
type EpisodePros = {
    episode: Episode;
}

export default function Episode( {episode}: EpisodePros) {

    const { play } = usePlayer();

    return (
        <div className={styles.episode}>

            <Head>
                <title>{episode.title} | Podcastr</title>
            </Head>


            <div className={styles.thumbnailContainer}>
                <Link href="/">
                    <button type="button">
                        <img src="/arrow-left.svg" alt="Voltar" />
                    </button>
                </Link>
                <Image
                    width={700}
                    height={160}
                    src={episode.thumbnail}
                    objectFit="cover"
                />
                <button type="button" onClick={() => play(episode)}>
                    <img src="/play.svg" alt="Tocar episodio"  /> 
                </button>
            </div>
            <header>
                <h1>{episode.title}</h1>
                <span>{episode.members}</span>
                <span>{episode.publishedAt}</span>
                <span>{episode.durationAsString}</span>
            </header>
            <div 
                className={styles.description} 
                dangerouslySetInnerHTML={{ __html: episode.description}} 
            />

        </div>
    );
}

// fallback = true => clinte(browser)  
// fallback = blocking => nextjs (nodejs)
// fallback - false => server(back-end)
export const getStaticPaths: GetStaticPaths = async (context) => {
    return {
        paths: [],
        fallback: 'blocking'
    }
}

export const getStaticProps: GetStaticProps = async ( context) => {

    const { slug } = context.params;

    const { data } = await api.get(`/episodes/${slug}`);

    const episode = {
        id: data.id,
        title: data.title,
        thumbnail : data.thumbnail,
        members: data.members,
        publishedAt:  format(parseISO(data.published_at), 'd MMM yy', {locale: ptBR}),
        durationAsString: convertDurationToTimeString(Number(data.file.duration)),
        description: data.description,
        url: data.file.url,

    }

    return {
        props: {
            episode, 
        },
        revalidate: 60 *60 *24, // tempo de recarga
    }
}