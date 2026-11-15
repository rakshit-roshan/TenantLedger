package in.gharkhata.controller;

import in.gharkhata.dto.RecordPaymentRequest;
import in.gharkhata.model.PaymentReceipt;
import in.gharkhata.service.PaymentService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/payments")
public class PaymentController {

    private final PaymentService paymentService;

    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    @GetMapping
    public ResponseEntity<List<PaymentReceipt>> getReceipts() {
        return ResponseEntity.ok(paymentService.getAllReceipts());
    }

    @PostMapping
    public ResponseEntity<PaymentReceipt> recordPayment(@RequestBody RecordPaymentRequest req) {
        return ResponseEntity.ok(paymentService.recordPayment(req));
    }

    @PostMapping("/{id}/reverse")
    public ResponseEntity<PaymentReceipt> reversePayment(@PathVariable UUID id, @RequestBody Map<String, String> body) {
        String reason = body.getOrDefault("reason", "Customer requested reversal");
        return ResponseEntity.ok(paymentService.reversePayment(id, reason));
    }
}

