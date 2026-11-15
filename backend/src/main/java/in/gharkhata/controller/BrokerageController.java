package in.gharkhata.controller;

import in.gharkhata.model.BrokerageDeal;
import in.gharkhata.service.BrokerageService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/broker/deals")
public class BrokerageController {

    private final BrokerageService brokerageService;

    public BrokerageController(BrokerageService brokerageService) {
        this.brokerageService = brokerageService;
    }

    @GetMapping
    public ResponseEntity<List<BrokerageDeal>> getDeals() {
        return ResponseEntity.ok(brokerageService.getDeals());
    }

    @PostMapping
    public ResponseEntity<BrokerageDeal> createDeal(@RequestBody BrokerageDeal deal) {
        return ResponseEntity.ok(brokerageService.createDeal(deal));
    }
}

