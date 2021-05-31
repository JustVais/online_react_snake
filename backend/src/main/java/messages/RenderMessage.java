package messages;

import com.example.snake.snake.models.Apple;
import com.example.snake.snake.models.Snake;

public class RenderMessage {

  private final Snake[] snakes;
  private final Apple apple;

  public RenderMessage(Snake[] snakes, Apple apple) {
    this.snakes = snakes;
    this.apple = apple;
  }

  public Snake[] getSnakes() {
    return snakes;
  }

  public Apple getApple() {
    return apple;
  }
}
