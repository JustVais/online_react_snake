package services;

import com.example.snake.snake.models.Direction;
import com.example.snake.snake.models.Snake;
import com.fasterxml.jackson.annotation.JsonAutoDetect;
import com.fasterxml.jackson.annotation.PropertyAccessor;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import components.IGameComponent;
import messages.RenderMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

public class GameService {

  @Autowired
  private SimpMessagingTemplate simpMessagingTemplate;

  @Autowired
  private IGameComponent game;

  public void spawn(String sessionId) {
    Snake snake = new Snake(game);

    game.addSnake(sessionId, snake);

    System.out.println("Spawned: " + sessionId);
  }

  public void changeDirection(String sessionId, String strDirection) {

    Direction.Point newDirection = null;

    switch (strDirection) {
      case "w":
        newDirection = Direction.Point.TOP;
        break;
      case "a":
        newDirection = Direction.Point.LEFT;
        break;
      case "s":
        newDirection = Direction.Point.BOTTOM;
        break;
      case "d":
        newDirection = Direction.Point.RIGHT;
        break;
    }

    if (newDirection == null) return;

    game.changeSnakeDirection(sessionId, newDirection);
  }

  public void render() throws JsonProcessingException {
    game.moveSnakes();

    ObjectMapper objectMapper = new ObjectMapper();
    objectMapper.setVisibility(PropertyAccessor.FIELD, JsonAutoDetect.Visibility.ANY);

    String dtoAsString = objectMapper.writeValueAsString(new RenderMessage(game.getSnakes(), game.getApple()));

    simpMessagingTemplate.convertAndSend("/room", dtoAsString);
  }

  public void onDisconnect(SessionDisconnectEvent event) {
    game.removeSnake(event.getSessionId());
    System.out.println("Disconnect: " + event.getSessionId());
  }
}
