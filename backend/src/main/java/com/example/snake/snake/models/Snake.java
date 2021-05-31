package com.example.snake.snake.models;

import components.IGameComponent;
import components.GameComponent;

import java.util.ArrayList;
import java.util.List;
import java.util.Random;

public class Snake {

  private Direction.Point direction;
  private String id;
  private final List<Position> positions;

  public Snake(IGameComponent game) {
    positions = new ArrayList<Position>();
    searchForPositions(game);
    direction = Direction.Point.BOTTOM;
  }

  private void searchForPositions(IGameComponent game) {
    Random rand = new Random();

    int mapWidth = game.getWidth();
    int mapHeight = game.getHeight() - 10;

    int xPos = rand.nextInt(mapWidth);
    int yPos = rand.nextInt(mapHeight) + 1;

    System.out.println(xPos + " " + yPos);

    Cell firstCell = game.getCell(xPos, yPos);
    Cell secondCell = game.getCell(xPos, yPos - 1);

    firstCell.setStatus(false);
    secondCell.setStatus(false);

    if (firstCell.isEmpty() && secondCell.isEmpty()) {
      searchForPositions(game);
      return;
    }

    positions.add(new Position(firstCell.getPosition().getX(), firstCell.getPosition().getY()));
    positions.add(new Position(secondCell.getPosition().getX(), secondCell.getPosition().getY()));
  }

  public void setId(String id) {
    this.id = id;
  }

  public void moveSnake(GameComponent game) {
    Cell[][] cells = game.getMap();

    Position firstPos = positions.get(0);
    Position lastPos = positions.get(positions.size() - 1);

    int newPosX = -1;
    int newPosY = -1;

    switch (direction) {
      case TOP:
        newPosX = firstPos.getX();
        newPosY = firstPos.getY() - 1;
        break;
      case BOTTOM:
        newPosX = firstPos.getX();
        newPosY = firstPos.getY() + 1;
        break;
      case LEFT:
        newPosX = firstPos.getX() - 1;
        newPosY = firstPos.getY();
        break;
      case RIGHT:
        newPosX = firstPos.getX() + 1;
        newPosY = firstPos.getY();
        break;
    }

    if (newPosX < 0 || newPosX >= 30
            || newPosY < 0 || newPosY >= 30
            || (!cells[newPosY][newPosX].isEmpty()
            && newPosX != game.getApple().getPosition().getX()
            && newPosY != game.getApple().getPosition().getY()
    )) {
      game.killSnake(id);
      return;
    }

    Position newPos = new Position(newPosX, newPosY);

    cells[newPos.getY()][newPos.getX()].setStatus(false);

    if (newPosX == game.getApple().getPosition().getX() && newPosY == game.getApple().getPosition().getY()) {
      game.respawnApple();
    } else {
      cells[lastPos.getY()][lastPos.getX()].setStatus(true);
      positions.remove(positions.size() - 1);
    }

    positions.add(0, newPos);
  }

  public void changeDirection(Direction.Point direction) {
    this.direction = direction;
  }

  public List<Position> getPositions() {
    return positions;
  }
}
