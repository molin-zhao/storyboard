package com.cokewise.storyboard.routers;

import com.alibaba.fastjson.JSONArray;
import com.cokewise.storyboard.exception.ServiceException;
import com.cokewise.storyboard.utils.POIExcel;
import com.cokewise.storyboard.utils.Response;
import com.fasterxml.jackson.databind.util.JSONPObject;
import org.apache.poi.hssf.usermodel.HSSFWorkbook;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.apache.tomcat.util.json.JSONParser;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import javax.servlet.http.HttpServletRequest;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Map;

@CrossOrigin
@RestController
@RequestMapping("/file")
public class Excel {

    @GetMapping("")
    public ResponseEntity<Map<String, Object>> index(){
        return Response.ok(HttpStatus.OK, "file controller is ok");
    }
    @PostMapping("/upload")
    public ResponseEntity<Map<String, Object>>  uploadFile (
            HttpServletRequest request,
            @RequestParam(value = "file", required = false)MultipartFile file
            ) throws IOException {
        request.setCharacterEncoding("UTF-8");
        String fieldsJson = request.getParameter("fields");
        // 1. check file is not empty
        if(file.isEmpty() || fieldsJson.equals(""))
            throw new ServiceException(HttpStatus.SERVICE_UNAVAILABLE, "required file not presented");
        JSONArray fieldsArray = JSONArray.parseArray(fieldsJson);
        List fields = fieldsArray.toJavaList(String.class);
        // 2. check file extension is valid
        Workbook book;
        String fileName = file.getOriginalFilename();
        String fileExtension = fileName.substring(fileName.lastIndexOf("."));
        if(".xls".equals(fileExtension)) book = new HSSFWorkbook(file.getInputStream());
        else if(".xlsx".equals(fileExtension)) book = new XSSFWorkbook(file.getInputStream());
        else throw new ServiceException(HttpStatus.SERVICE_UNAVAILABLE, "excel format file required");
        // 3. check book
        if(book == null) throw new ServiceException(HttpStatus.SERVICE_UNAVAILABLE, "cannot create workbook");
        // 4. do the work!
        Sheet sheet;
        Row row ;
        Cell cell;
        List sheetData = new ArrayList();
        for(int i = 0; i < book.getNumberOfSheets(); i++){
            sheet = book.getSheetAt(i);
            if(sheet == null) continue;
            List<Integer> fieldIndexRefList = new ArrayList();
            for(int j = sheet.getFirstRowNum(); j <= sheet.getLastRowNum(); j++){
                row = sheet.getRow(j);
                if(row == null) continue;
                if(j == sheet.getFirstRowNum()){
                    // first row, compute index reference
                    Cell fieldCell;
                    for(int k = row.getFirstCellNum(); k < row.getLastCellNum(); k++){
                        fieldCell = row.getCell(k);
                        if(fieldCell == null) continue;
                        String fieldName = POIExcel.getCellValue(fieldCell);
                        if(fields.contains(fieldName)){
                            fieldIndexRefList.add(fields.indexOf(fieldName));
                        }
                    }
                    if(fieldIndexRefList.size() != fields.size()) throw new ServiceException(HttpStatus.SERVICE_UNAVAILABLE, "workbook fields not match warehouse");
                    continue;
                }
                // parse worksheet row data
                String[] rowData = new String[fields.size()];
                Integer refIndex = 0;
                for(int k = row.getFirstCellNum(); k < row.getLastCellNum(); k++){
                    cell = row.getCell(k);
                    if(cell == null) continue;
                    Integer index = fieldIndexRefList.get(refIndex);
                    rowData[index] = POIExcel.getCellValue(cell);
                    refIndex ++;
                }
                sheetData.add(rowData);
            }
        }
        return Response.ok(HttpStatus.OK, "ok", sheetData);
    }

    @PostMapping("/export")
    public ResponseEntity<Map<String, Object>> exportData (@RequestBody Map<String, Object> data ){
        return Response.ok(HttpStatus.OK, "ok", data);
    }
}
