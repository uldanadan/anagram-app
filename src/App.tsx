import React, {ChangeEvent, useEffect, useState} from 'react';
import './App.css';
import ReactModal from 'react-modal';
import refresh from './icons/ei_refresh.svg';
import close from './icons/close.svg';

function App() {
  const [items, setItems] = useState<any>([]);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [isLoad, setIsLoad] = useState(false);
  const [startTime, setStartTime] = useState<Date>(new Date());
  const [spentTime, setSpentTime] = useState<string>();

  useEffect(() => {
    getWords();
  }, []);

  // Doesn't need CORS off
  // async function getWords() {
  //     setIsLoad(true);
  //     let words: string[] = [];
  //     const urls: string[] = ['https://san-random-words.vercel.app/', 'https://san-random-words.vercel.app/', 'https://san-random-words.vercel.app/', 'https://san-random-words.vercel.app/', 'https://san-random-words.vercel.app/', 'https://san-random-words.vercel.app/'];
  //     await Promise.all(urls.map(async url => {
  //         await fetch(url).then(resp => {
  //             resp.json().then(word => {
  //                 words.push(word[0].word.toLowerCase())
  //             })
  //         });
  //     }))
  //     generateItems(words);
  //     // generateItems(['silent', 'react', 'bear', 'task', 'anagram']);
  // }

  // Needs CORS off
  async function getWords() {
    setIsLoad(true);
    const urls: string[] = ['http://watchout4snakes.com/Random/RandomWord', 'http://watchout4snakes.com/Random/RandomWord', 'http://watchout4snakes.com/Random/RandomWord', 'http://watchout4snakes.com/Random/RandomWord', 'http://watchout4snakes.com/Random/RandomWord']
    const words: string[] = await Promise.all(urls.map(async url => {
      const resp = await fetch(url, {method: 'POST'});
      return resp.text();
    }));
    generateItems(words);
    // generateItems(['silent', 'react', 'bear', 'task', 'anagram']);
  }

  function generateItems(words: string[]) {
    const shuffledWords: any = [];
    words.forEach(w => {
      const array = w.split('');
      for(let i = array.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        let tmp = array[i];
        array[i] = array[j];
        array[j] = tmp;
      }
      shuffledWords.push({
        word: w,
        typedWord: '',
        letters: array.map(a => {
          return {
            isUsed: false,
            letter: a
          }
        }),
        isError: false
      });
    })
    setStartTime(new Date());
    setIsLoad(false);
    setItems(shuffledWords);
  }

  function newGame() {
    window.location.reload();
  }

  function onChangeInput(event: ChangeEvent<HTMLInputElement>, item: any, index: number) {
    const updatedItems: any = items;
    const updatedLetters: any = item.letters.map((l: any) => {
      return {
        letter: l.letter,
        isUsed: false
      }
    });
    event.target.value.split('').forEach(v => {
      for(let i = 0; i < updatedLetters.length; i++) {
        if(updatedLetters[i].letter === v && !updatedLetters[i].isUsed) {
          updatedLetters[i].isUsed = true;
          break;
        }
      }
    })
    updatedItems[index].letters = updatedLetters;
    updatedItems[index].typedWord = event.target.value;
    setItems([...updatedItems]);
  }

  function checkResult() {
    const updatedItems: any = items;
    let hasError = false;
    updatedItems.forEach((item: any) => {
      if(item.word !== item.typedWord) {
        item.isError = true;
        hasError = true;
      } else {
        item.isError = false;
      }
    })
    setItems([...updatedItems]);
    if(!hasError) {
      setSpentTime(getTimeDiff());
      setModalIsOpen(true);
    }
  }

  function getTimeDiff() {
    const result = [];
    const endTime = new Date();
    let diff = endTime.getTime() - startTime.getTime();
    const hours = Math.floor(diff / 1000 / 60 / 60);
    diff -= hours * 1000 * 60 * 60;
    const minutes = Math.floor(diff / 1000 / 60);
    const seconds = Math.floor(diff / 1000);

    if (hours) {
      result.push(hours + ' ч ')
    }
    if (minutes) {
      result.push(minutes + ' мин ')
    }
    if (seconds) {
      result.push(seconds + 'с')
    }

    return result.join('')
  }

  return (
      <div className="container">
        <h1>Анаграммы</h1>
        <div className="refresh" onClick={newGame}>
          <button>новые слова</button>
          <img src={refresh}/>
        </div>
        <div className="block">
          { isLoad ? (<div>Loading...</div>) : (
              items.map((item: any, index: number) =>
                  <div className="block__item" key={'word-' + index}>
                    <label htmlFor={'word-' + index}>
                      { item?.letters?.map(((letterItem: any, idx: number) =>
                              <span className={letterItem.isUsed ? 'isUsed' : ''} key={'letter-' + idx}>{ letterItem.letter }</span>
                      )) }
                    </label>
                    <input
                        className={item.isError ? 'error' : ''}
                        id={'word-' + index}
                        type="text"
                        maxLength={item.word.length}
                        onChange={(event) => {onChangeInput(event, item, index)}}
                    />
                  </div>
              )
          ) }
        </div>
        <button className="check" onClick={checkResult}>Проверить</button>

        <ReactModal className="modal" isOpen={modalIsOpen}>
          <div className="modal__content">
            <img src={close} alt="" onClick={() => setModalIsOpen(false)} />
            <h2>Поздравляем!</h2>
            <p>Вы решили все анаграммы</p>
            <div className="modal__content-time">Вы потратили: <span>{ spentTime }</span></div>
            <div className="modal__button">
              <button className='btn' onClick={newGame}>Новая игра</button>
              <button className="btn btn-danger" onClick={() => setModalIsOpen(false)}>Закрыть</button>
            </div>
          </div>
        </ReactModal>
      </div>
  );
}

export default App;
