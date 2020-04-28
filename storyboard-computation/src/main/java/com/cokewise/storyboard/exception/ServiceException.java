package com.cokewise.storyboard.exception;

import org.springframework.http.HttpStatus;

public class ServiceException extends RuntimeException{
    private static final long serialVersionUID = 1L;

    protected HttpStatus errorCode;
    protected String errorMsg;

    public ServiceException(){super();}

    public ServiceException(HttpStatus code, String message){
        super(code.toString());
        this.errorCode = code;
        this.errorMsg = message;
    }

    public ServiceException(HttpStatus code, String message, Throwable cause){
        super(code.toString(), cause);
        this.errorCode = code;
        this.errorMsg = message;
    }

    public ServiceException(String message){
        super(message);
        this.errorMsg = message;
    }

    public HttpStatus getErrorCode() {
        return errorCode;
    }

    public void setErrorCode(HttpStatus errorCode) {
        this.errorCode = errorCode;
    }

    public void setErrorMsg(String errorMsg) {
        this.errorMsg = errorMsg;
    }

    public String getErrorMsg() {
        return errorMsg;
    }

    public String getMessage(){
        return errorMsg;
    }

    @Override
    public Throwable fillInStackTrace(){
        return this;
    }
}
