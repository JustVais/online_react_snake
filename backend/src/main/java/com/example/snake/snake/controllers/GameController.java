package com.example.snake.snake.controllers;


import com.fasterxml.jackson.core.JsonProcessingException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.handler.annotation.Header;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Controller;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;
import services.GameService;

@Controller
public class GameController {

  @Autowired
  private GameService gameService;

  @MessageMapping("/spawn")
  public void spawn(@Header("simpSessionId") String sessionId) {
    gameService.spawn(sessionId);
  }

  @MessageMapping("/change_direcion")
  public void changeDirection(String message, @Header("simpSessionId") String sessionId) {
    gameService.changeDirection(sessionId, message);
  }

  @Scheduled(fixedRate = 500)
  public void render() throws JsonProcessingException {
    gameService.render();
  }

  @EventListener
  public void onDisconnectEvent(SessionDisconnectEvent event) {
    gameService.onDisconnect(event);
  }
}

