package com.example.snake.snake.models;

public class Cell {
  private boolean isEmpty = true;
  private Position position;

  public Cell(Position position) {
    this.position = position;
  }

  public boolean isEmpty() {
    return isEmpty;
  }

  public Position getPosition() {
    return position;
  }

  public void setStatus(boolean status) {
    isEmpty = status;
  }
}
