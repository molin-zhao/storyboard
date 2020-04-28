package com.cokewise.storyboard.routers;

import com.cokewise.storyboard.utils.Response;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/")
public class Index {
    @GetMapping("/")
    public ResponseEntity<Map<String, Object>> index (){
        return Response.ok(HttpStatus.OK, "storyboard springboot application is running");
    }
}
