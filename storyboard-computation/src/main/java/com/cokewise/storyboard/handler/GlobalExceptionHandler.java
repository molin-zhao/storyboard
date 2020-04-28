package com.cokewise.storyboard.handler;

import com.cokewise.storyboard.exception.ServiceException;
import com.cokewise.storyboard.utils.Response;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.servlet.NoHandlerFoundException;

import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger logger = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String,Object>> defaultExceptionHandler(Exception e) {
        if (e instanceof NoHandlerFoundException) {
            return Response.error(HttpStatus.NOT_FOUND, "not found");
        }
        else {
            e.printStackTrace();
            return Response.error(HttpStatus.INTERNAL_SERVER_ERROR, "server error");
        }
    }

    @ExceptionHandler(ServiceException.class)
    public ResponseEntity<Map<String, Object>> serviceExceptionHandler(ServiceException e){
        logger.error("service error: ", e);
        return Response.error(e.getErrorCode(), e.getMessage());
    }
}
