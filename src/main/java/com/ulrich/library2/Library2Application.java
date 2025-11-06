package com.ulrich.library2;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.info.Contact;
import io.swagger.v3.oas.annotations.info.Info;

@SpringBootApplication
@OpenAPIDefinition(
	info = @Info(
		title = "Library Spring Boot REST API Documentation",
		description = "REST APIs For Managing Books loans in a Library",
		version = "1.0",
		contact = @Contact(name = "tasse ulrich", email = "bobotuekam@gmail.com")
	)
)
public class Library2Application {

	public static void main(String[] args) {
		SpringApplication.run(Library2Application.class, args);
	}
}
