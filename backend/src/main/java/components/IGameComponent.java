package components;

import com.example.snake.snake.models.Cell;
import com.example.snake.snake.models.Direction;
import com.example.snake.snake.models.Apple;
import com.example.snake.snake.models.Snake;

public interface IGameComponent {
//  int width();
//
//  int height();
//
//  Snake[] snakeList();
//
//  Apple apple();

  void addSnake(String id, Snake snake);

  Snake[] getSnakes();

  Cell getCell(int x, int y);

  int getWidth();

  int getHeight();

  void fillMap();

  void moveSnakes();

  Cell[][] getMap();

  void changeSnakeDirection(String snakeId, Direction.Point direction);

  Apple getApple();

  void removeSnake(String snakeId);

  void killSnake(String sessionId);
}
