package com.cokewise.storyboard.utils;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.HashMap;
import java.util.Map;

public class Response {

    public static ResponseEntity<Map<String, Object>> ok(HttpStatus code, String message, Object data){
        Map<String, Object> map = new HashMap<String, Object>();
        map.put("message", message);
        map.put("data", data);
        return new ResponseEntity<Map<String, Object>>(map, code);

    }
    public static ResponseEntity<Map<String, Object>> error(HttpStatus code, String message, Object data){
        Map<String, Object> map = new HashMap<String, Object>();
        map.put("message", message);
        map.put("data", data);
        return new ResponseEntity<Map<String, Object>>(map, code);
    }

    public static ResponseEntity<Map<String, Object>> ok(HttpStatus code, String message){
        Map<String, Object> map = new HashMap<String, Object>();
        map.put("message", message);
        return new ResponseEntity<Map<String, Object>>(map, code);
    }

    public static ResponseEntity<Map<String, Object>> error(HttpStatus code, String message){
        Map<String, Object> map = new HashMap<String, Object>();
        map.put("message", message);
        return new ResponseEntity<Map<String, Object>>(map, code);
    }

    public static ResponseEntity<Map<String, Object>> ok(String message){
        Map<String, Object> map = new HashMap<String, Object>();
        map.put("message", message);
        return new ResponseEntity<Map<String, Object>>(map, HttpStatus.OK);
    }

    public static ResponseEntity<Map<String, Object>> error(String message){
        Map<String, Object> map = new HashMap<String, Object>();
        map.put("message", message);
        return new ResponseEntity<Map<String, Object>>(map, HttpStatus.INTERNAL_SERVER_ERROR);
    }
}
