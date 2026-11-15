package in.gharkhata.controller;

import in.gharkhata.model.Building;
import in.gharkhata.model.Unit;
import in.gharkhata.service.BuildingService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping
public class BuildingController {

    private final BuildingService buildingService;

    public BuildingController(BuildingService buildingService) {
        this.buildingService = buildingService;
    }

    @GetMapping("/buildings")
    public ResponseEntity<List<Building>> getBuildings() {
        return ResponseEntity.ok(buildingService.getAllBuildings());
    }

    @PostMapping("/buildings")
    public ResponseEntity<Building> createBuilding(@RequestBody Building building) {
        return ResponseEntity.ok(buildingService.createBuilding(building));
    }

    @GetMapping("/units")
    public ResponseEntity<List<Unit>> getUnits(@RequestParam(required = false) UUID buildingId) {
        return ResponseEntity.ok(buildingService.getUnits(buildingId));
    }

    @PostMapping("/units")
    public ResponseEntity<Unit> createUnit(@RequestBody Unit unit) {
        return ResponseEntity.ok(buildingService.createUnit(unit));
    }

    @PostMapping("/units/bulk")
    public ResponseEntity<List<Unit>> bulkCreateUnits(@RequestBody List<Unit> units) {
        return ResponseEntity.ok(buildingService.bulkCreateUnits(units));
    }

    @PostMapping("/units/copy-floor")
    public ResponseEntity<List<Unit>> copyFloorUnits(@RequestBody Map<String, Object> req) {
        UUID buildingId = UUID.fromString((String) req.get("buildingId"));
        int sourceFloor = Integer.parseInt(req.get("sourceFloor").toString());
        int targetFloor = Integer.parseInt(req.get("targetFloor").toString());
        return ResponseEntity.ok(buildingService.copyFloorUnits(buildingId, sourceFloor, targetFloor));
    }
}
