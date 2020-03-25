package com.cokewise.storyboard.routers;

import com.cokewise.storyboard.exception.ServiceException;
import com.cokewise.storyboard.utils.POIExcel;
import com.cokewise.storyboard.utils.Response;
import org.apache.poi.hssf.usermodel.HSSFWorkbook;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/xlxs")
public class Excel {

    @GetMapping("/")
    public ResponseEntity<Map<String, Object>> index(){
        return Response.ok(HttpStatus.OK, "xlxs controller is ok");
    }
    @PostMapping("/import")
    public ResponseEntity<Map<String, Object>>  importData (@RequestParam("file")MultipartFile file) throws IOException {
        // 1. check file is not empty
        if(file.isEmpty()) throw new ServiceException(HttpStatus.SERVICE_UNAVAILABLE, "file not presented");
        // 2. check file extension is valid
        Workbook book = null;
        String fileName = file.getOriginalFilename();
        String fileExtension = fileName.substring(fileName.lastIndexOf("."));
        if(".xls".equals(fileExtension)) book = new HSSFWorkbook(file.getInputStream());
        else if(".xlsx".equals(fileExtension)) book = new XSSFWorkbook(file.getInputStream());
        else throw new ServiceException(HttpStatus.SERVICE_UNAVAILABLE, "excel format file required");
        // 3. check book
        if(book == null) throw new ServiceException(HttpStatus.SERVICE_UNAVAILABLE, "cannot create workbook");
        // 4. do the work!
        Sheet sheet = null;
        Row row = null;
        Cell cell = null;
        List list = new ArrayList();
        for(int i=0; i<book.getNumberOfSheets(); i++){
            sheet = book.getSheetAt(i);
            if(sheet == null) continue;
            for(int j=sheet.getFirstRowNum(); j<=sheet.getLastRowNum(); j++){
                row = sheet.getRow(j);
                if(row == null || row.getFirstCellNum() == j) continue;
                List<Object> li = new ArrayList<Object>();
                for(int k = row.getFirstCellNum(); k<row.getLastCellNum(); k++){
                    cell = row.getCell(k);
                    li.add(POIExcel.getCellValue(cell));
                }
                list.add(li);
            }
        }
        System.out.println(list);
        return Response.ok(HttpStatus.OK, "ok", list);
    }

    @PostMapping("/export")
    public ResponseEntity<Map<String, Object>> exportData (@RequestBody Map<String, Object> data ){
        return Response.ok(HttpStatus.OK, "ok", data);
    }
}
