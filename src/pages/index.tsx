import { GetStaticProps } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import Head from 'next/head';

import { format, parseISO } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';

import { Header } from "../components/Header"
import api from "../services/api";
import { convertDurationToTimeString } from '../ultils';
import {usePlayer } from '../contexts/PlayerContext';

import styles from './home.module.scss';

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
type HomeProps = {
  lastestEpisodes: Episode[];
  allEpisodes: Episode[];
}

export default function Home( {lastestEpisodes, allEpisodes}: HomeProps) {

  const {playList} = usePlayer();

  const episodeList = [...lastestEpisodes, ...allEpisodes];
 
  return (
    <div className={styles.homepage}>

      <Head>
        <title>Home | Podcastr</title>
      </Head>

        <section className={styles.lastestEpisodes}>
          <h2>Últimos Lancamentos</h2>
          <ul>
              {
                lastestEpisodes.map( (episode, index) => {
                  return (
                      <li key={episode.id}>
                        <Image 
                          width={192} 
                          height={192} 
                          src={episode.thumbnail} 
                          alt={episode.title}  
                          objectFit="cover"
                        />

                        <div className={styles.episodesDetails}>
                          <Link href={`/episodes/${episode.id}`}>
                            <a>{episode.title}</a>
                          </Link>
                          <p>{episode.members}</p> 
                          <span>{episode.publishedAt}</span>
                          <span>{episode.durationAsString}</span>
                        </div>

                        <button type="button" onClick={ () => playList(episodeList, index)}>
                            <img src="/play-green.svg" alt="Tocar Episodio" />
                        </button>
                      </li>
                  )
                })
              }
          </ul>
        </section>
        <section className={styles.allEpisodes}>

              <h2>Todos os Episódios</h2>
              
              <table cellSpacing={0}>
                <thead>
                  <tr>
                    <th></th>
                    <th>PodCast</th>
                    <th>Integrantes</th>
                    <th>Data</th>
                    <th>Duração</th>
                    <th> </th>
                  </tr>
                </thead>
                <tbody>
                  { 
                      allEpisodes.map( (episodes, index) => {
                        return (
                            <tr key={episodes.id}>
                              <td style={{ width: 60 }}>
                                <Image
                                  width={120}
                                  height={120}
                                  src={episodes.thumbnail}
                                  alt={episodes.title}
                                  objectFit="cover"
                                />
                                
                              </td>
                              <td>
                                <Link href={`/episodes/${episodes.id}`}>
                                    <a>{episodes.title}</a>
                                </Link>
                                
                              </td>
                              <td>{episodes.members}</td>
                              <td style={{ width:100 }}>{episodes.publishedAt}</td>
                              <td>{episodes.durationAsString}</td>
                              <td>
                                <button type="button" onClick={ ()=> playList(episodeList, index + lastestEpisodes.length) }>
                                  <img src="/play-green.svg" alt="Tocar Episódio"/>
                                </button>
                              </td>
                            </tr>
                        )
                      })
                  }
                </tbody>

              </table>

        </section>
    </div>
    
  )
}
// ssg
export const getStaticProps: GetStaticProps = async () => {  
  const { data }  = await api.get('/episodes', {
    params : {
      _limit : 12,
      _sort : 'published_at',
      _order: 'desc'
    }

  });

  const episodes = data.map( episode =>{
      return {
        id: episode.id,
        title: episode.title,
        thumbnail : episode.thumbnail,
        members: episode.members,
        publishedAt:  format(parseISO(episode.published_at), 'd MMM yy', {locale: ptBR}),
        durationAsString: convertDurationToTimeString(Number(episode.file.duration)),
        duration: Number(episode.file.duration),
        description: episode.description,
        url: episode.file.url,
      };
  });
  
  const lastestEpisodes = episodes.slice(0,2);
  const allEpisodes = episodes.slice(2, episodes.lenght);

  return {
    props : {
      lastestEpisodes,
      allEpisodes,
    },
    revalidate: 60 * 60 *8,
  }
}

//spa => singel page aplication => carrega no tempo de execucao
//ssr => server side render => renderiza no lado do servidor
//ssg => static server generetion


 //modelo spa
  // useEffect( () => {
  //   fetch('http://localhost:3333/episodes')
  //     .then( response => response.json())
  //     .then( data => console.log(data))
  //     .catch();
  // }, []);

  

// // ssg
// export async function getStaticProps() {  
//   const response = await fetch('http://localhost:3333/episodes');
//   const data = await response.json();
//   return {
//     props : {
//       episodes: data,
//     },
//     revalidate: 60 * 60 *8,
//   }
// }

// // ssr
// export async function getServerSideProps() {  
//   const response = await fetch('http://localhost:3333/episodes');
//   const data = await response.json();
//   return {
//     props : {
//       episodes: data,
//     }
//   }
// }
