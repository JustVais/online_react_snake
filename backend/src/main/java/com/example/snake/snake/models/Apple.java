package com.example.snake.snake.models;

public class Apple {
  private Position position;

  public Apple(Position position) {
    spawnApple(position);
  }

  public Position getPosition() {
    return position;
  }

  private void spawnApple(Position position) {
    this.position = position;
  }
}
