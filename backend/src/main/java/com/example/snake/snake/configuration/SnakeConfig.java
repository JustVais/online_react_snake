package com.example.snake.snake.configuration;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.web.socket.config.annotation.*;
import services.GameService;

@Configuration
@EnableScheduling
@EnableWebSocketMessageBroker
@ComponentScan({"components"})
public class SnakeConfig implements WebSocketConfigurer, WebSocketMessageBrokerConfigurer {

  @Override
  public void registerStompEndpoints(StompEndpointRegistry registry) {
    registry.addEndpoint("/chat").setAllowedOriginPatterns("*").withSockJS();
  }

  @Override
  public void registerWebSocketHandlers(WebSocketHandlerRegistry webSocketHandlerRegistry) {
    webSocketHandlerRegistry.addHandler(new WebSocketHandler())
            .setAllowedOriginPatterns("*");
  }

  @Bean
  public WebSocketHandler getWebSocketHandler() {
    return new WebSocketHandler();
  }

  @Bean
  public GameService getGameService() {return new GameService();}
}