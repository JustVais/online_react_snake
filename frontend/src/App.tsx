import { useCallback, useEffect, useState } from "react";
import styled from "styled-components";

import { stompClient } from './index'

interface ICell {
  contentId: null | number
  userId?: string
}

interface IPosition {
  readonly x: number
  readonly y: number
}

interface ISnake {
  readonly id: string
  readonly direction: number
  readonly positions: IPosition[]
}

interface IApple {
  readonly position: IPosition
}



// interface IMap {
//   cells: ICell[]
// }

const generateMap = (width: number, height: number): ICell[][] => {
  const map: ICell[][] = []

  for (let i = 0; i < height; i++) {
    // const row: ICell[] = new Array<ICell>(width).fill(({contentId: null}))
    const row: ICell[] = []
    for (let j = 0; j < width; j++) {
      row.push({ contentId: null })
    }
    map.push(row)
  }

  return map
}

function App() {
  // let [socket] = useState(io("localhost:8080"))
  // let [socket] = useState(new WebSocket("ws://localhost:8080")) 
  const [map, setMap] = useState<ICell[][]>(generateMap(30, 30))
  const [inGame, setInGame] = useState<boolean>(false)
  const [, setSessionId] = useState<string>("")
  // const [snakes, setSnakes] = useState<ISnake[]>([])

  useEffect(() => {
    stompClient.debug = function (str) { }

    stompClient.connect({}, () => {
      const ws: any = stompClient.ws

      let url: string = ws._transport.url

      let sid = url.replace("/websocket", "")
      sid = sid.substring(sid.length - 8)

      setSessionId(sid)

      console.log(sid)

      stompClient.subscribe(`/${sid}/dead`, (message) => {
        setInGame(false)
      })

      stompClient.subscribe('/room', (message) => {
        // setSnakes(JSON.parse(message.body).snakes)
        const parsedMessage = JSON.parse(message.body)

        // console.log(parsedMessage)

        const apple: IApple = parsedMessage.apple

        const snakes: ISnake[] = parsedMessage.snakes

        const newMap: ICell[][] = generateMap(30, 30)

        for (let i = 0; i < snakes.length; i++) {
          for (let j = 0; j < snakes[i].positions.length; j++) {
            const cellPos = snakes[i].positions[j]
            newMap[cellPos.y][cellPos.x].contentId = i
            newMap[cellPos.y][cellPos.x].userId = snakes[i].id
            // console.log(i)
          }
        }

        newMap[apple.position.y][apple.position.x].contentId = -1

        // console.log(newMap)

        setMap([...newMap])
      })
    })
    // stompClient.connect = function() {
    //   console.log('open');
    // };
    // setTimeout(() => {
    // }, 5000)

    function onKeyDown(event: KeyboardEvent) {
      if (!inGame) return

      const keyCode = event.key

      let pressedKey: string = ''

      switch (keyCode) {
        case 'd': //d
          pressedKey = 'd'
          break
        case 's': //s
          pressedKey = 's'
          break
        case 'a': //a
          pressedKey = 'a'
          break
        case 'w': //w
          pressedKey = 'w'
          break
      }

      if (!pressedKey) return

      stompClient.send('/change_direcion', {}, pressedKey)
    }

    window.addEventListener("keydown", onKeyDown, false)

    return () => {
      window.removeEventListener("keydown", onKeyDown, false)
    }
  }, [inGame])

  const onClickSpawnHandler = useCallback(() => {
    stompClient.send('/spawn', {})
    setInGame(true)
  }, [setInGame])

  return (
    <Container>
      <Map>
        {
          map.map((row, index) =>
            <Row key={index}>
              {
                row.map((cell, index) =>
                  <Cell key={index} contentId={cell.contentId} userId={cell.userId}></Cell>
                )
              }
            </Row>
          )
        }
      </Map>
      <SpawnButtonWrapper>
        {
          !inGame &&
          <SpawnButton onClick={onClickSpawnHandler}>Spawn</SpawnButton>
        }
      </SpawnButtonWrapper>
    </Container>
  );
}

function hashCode(str: string) { // java String#hashCode
  var hash = 0;
  for (var i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return hash;
}

function intToRGB(i: number) {
  var c = (i & 0x00FFFFFF)
    .toString(16)
    .toUpperCase();

  return "#"+"00000".substring(0, 6 - c.length) + c;
}

export default App;

const SpawnButtonWrapper = styled.div`
  margin-top: 20px;
  height: 40px;
  display: grid;
`


const SpawnButton = styled.button`
  background-color: #61DAFB;
  border: 0;
  width: 200px;
  height: 40px;
  border-radius: 5px;
  color: #000000;
  font-size: 16px;
  font-weight: bold;
  display: grid;
  justify-content: center;
  align-content: center;
  text-decoration: none;
  font-family: Arial, Helvetica, sans-serif;
  cursor: pointer;
  justify-self: center;
`

const Container = styled.div`
  display: grid;
  justify-content: center;
  align-content: center;
  height: 100vh;
`

const Map = styled.div`
  border: 5px solid #6D6D6D;
`

const Row = styled.div`
  height: 16px;
  margin: 0 0 2px 0;
`

const Cell = styled.div<{ contentId: null | number, userId: string | undefined }>`
  display: inline-block;
  width: 16px;
  height: 16px;
  margin: 1px;
  background-image: ${({ contentId }) => contentId === -1 ? "url(/apple.svg)" : "none"};
  background-color: ${({ userId }) => {
    if (userId) {
      return intToRGB(hashCode(userId))
    }
  }};
`