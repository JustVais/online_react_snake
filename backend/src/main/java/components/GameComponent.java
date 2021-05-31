package components;

import com.example.snake.snake.models.*;
import com.fasterxml.jackson.annotation.JsonAutoDetect;
import com.fasterxml.jackson.annotation.PropertyAccessor;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.Random;

@Component
public class GameComponent implements IGameComponent {
  private final int width, height;
  private final Cell[][] map;
  private final HashMap<String, Snake> snakeDict;

  private Apple apple;

  @Autowired
  private SimpMessagingTemplate simpMessagingTemplate;

  public GameComponent() {
    width = 30;
    height = 30;

    snakeDict = new HashMap<String, Snake>();
    map = new Cell[height][width];

    fillMap();
    respawnApple();
  }

  public void respawnApple() {
    Random rand = new Random();

    int xPos = rand.nextInt(width);
    int yPos = rand.nextInt(height);

    if (apple != null) {
      map[apple.getPosition().getY()][apple.getPosition().getX()].setStatus(false);
    }

    if (!map[yPos][xPos].isEmpty()) {
      respawnApple();
      return;
    }

    apple = new Apple(new Position(xPos, yPos));
  }

  public void addSnake(String id, Snake snake) {
    snake.setId(id);
    snakeDict.put(id, snake);
  }

  public Cell getCell(int x, int y) {
    return map[y][x];
  }

  public Snake[] getSnakes() {
    return snakeDict.values().toArray(new Snake[0]);
  }

  public int getWidth() {
    return width;
  }

  public int getHeight() {
    return height;
  }

  public void fillMap() {
    for (int i = 0; i < height; i++) {
      Cell[] row = new Cell[width];

      for (int j = 0; j < width; j++) {
        row[j] = new Cell(new Position(j, i));
      }

      map[i] = row;
    }
  }

  public void moveSnakes() {
    Snake[] snakes = snakeDict.values().toArray(new Snake[0]);

    for (int i = 0; i < snakes.length; i++) {
      snakes[i].moveSnake(this);
    }
  }

  public Cell[][] getMap () {
    return map;
  }

  public Apple getApple() {
    return apple;
  }

  public void changeSnakeDirection(String snakeId, Direction.Point direction) {
    snakeDict.get(snakeId).changeDirection(direction);
  }

  public void removeSnake(String snakeId) {
    snakeDict.get(snakeId).getPositions().stream().forEach(v -> map[v.getY()][v.getX()].setStatus(true));
    snakeDict.remove(snakeId);
  }

  public void killSnake(String sessionId) {
    removeSnake(sessionId);

    ObjectMapper objectMapper = new ObjectMapper();
    objectMapper.setVisibility(PropertyAccessor.FIELD, JsonAutoDetect.Visibility.ANY);

    simpMessagingTemplate.convertAndSend("/"+sessionId+"/dead", "");;
  }
}
