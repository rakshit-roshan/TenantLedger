package in.gharkhata.service;

import in.gharkhata.config.TenantContext;
import in.gharkhata.model.Building;
import in.gharkhata.model.Unit;
import in.gharkhata.repository.BuildingRepository;
import in.gharkhata.repository.UnitRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
public class BuildingService {

    private final BuildingRepository buildingRepository;
    private final UnitRepository unitRepository;
    private final AuditService auditService;

    public BuildingService(BuildingRepository buildingRepository, UnitRepository unitRepository, AuditService auditService) {
        this.buildingRepository = buildingRepository;
        this.unitRepository = unitRepository;
        this.auditService = auditService;
    }

    public List<Building> getAllBuildings() {
        UUID orgId = TenantContext.getOrgId();
        return buildingRepository.findAllByOrganizationId(orgId);
    }

    @Transactional
    public Building createBuilding(Building building) {
        UUID orgId = TenantContext.getOrgId();
        building.setOrganizationId(orgId);
        if (building.getId() == null) {
            building.setId(UUID.randomUUID());
        }
        Building saved = buildingRepository.save(building);
        auditService.log("BUILDING_CREATE", "Building", saved.getId().toString(), "Created building " + saved.getName(), null);
        return saved;
    }

    public List<Unit> getUnits(UUID buildingId) {
        UUID orgId = TenantContext.getOrgId();
        if (buildingId != null) {
            return unitRepository.findAllByOrganizationIdAndBuildingId(orgId, buildingId);
        }
        return unitRepository.findAllByOrganizationId(orgId);
    }

    @Transactional
    public Unit createUnit(Unit unit) {
        UUID orgId = TenantContext.getOrgId();
        unit.setOrganizationId(orgId);
        if (unit.getId() == null) {
            unit.setId(UUID.randomUUID());
        }
        Unit saved = unitRepository.save(unit);
        auditService.log("UNIT_CREATE", "Unit", saved.getId().toString(), "Created unit " + saved.getUnitNumber(), null);
        return saved;
    }

    @Transactional
    public List<Unit> bulkCreateUnits(List<Unit> units) {
        UUID orgId = TenantContext.getOrgId();
        List<Unit> saved = new ArrayList<>();
        for (Unit u : units) {
            u.setOrganizationId(orgId);
            if (u.getId() == null) {
                u.setId(UUID.randomUUID());
            }
            saved.add(unitRepository.save(u));
        }
        auditService.log("UNITS_BULK_CREATED", "Unit", String.valueOf(saved.size()), "Bulk added " + saved.size() + " units", null);
        return saved;
    }

    @Transactional
    public List<Unit> copyFloorUnits(UUID buildingId, int sourceFloor, int targetFloor) {
        UUID orgId = TenantContext.getOrgId();
        List<Unit> sourceUnits = unitRepository.findAllByOrganizationIdAndBuildingId(orgId, buildingId)
                .stream()
                .filter(u -> u.getFloorNumber() == sourceFloor)
                .toList();

        List<Unit> newUnits = new ArrayList<>();
        for (Unit src : sourceUnits) {
            Unit copy = new Unit();
            copy.setOrganizationId(orgId);
            copy.setId(UUID.randomUUID());
            copy.setBuildingId(src.getBuildingId());
            copy.setBuildingName(src.getBuildingName());
            copy.setFloorNumber(targetFloor);

            String srcNum = src.getUnitNumber();
            String targetNum = srcNum.replace(String.valueOf(sourceFloor), String.valueOf(targetFloor));
            if (targetNum.equals(srcNum)) {
                targetNum = targetFloor + "-" + srcNum;
            }
            copy.setUnitNumber(targetNum);
            copy.setType(src.getType());
            copy.setAreaSqft(src.getAreaSqft());
            copy.setBaseRentPaise(src.getBaseRentPaise());
            copy.setMaintenancePaise(src.getMaintenancePaise());
            copy.setDepositPaise(src.getDepositPaise());
            copy.setStatus("VACANT");
            copy.setPaymentStatus("VACANT");
            newUnits.add(unitRepository.save(copy));
        }

        auditService.log("FLOOR_COPIED", "Floor", String.valueOf(targetFloor),
                "Copied " + newUnits.size() + " units from floor " + sourceFloor + " to floor " + targetFloor, null);
        return newUnits;
    }

    @Transactional
    public Building updateBuilding(UUID id, Building updated) {
        UUID orgId = TenantContext.getOrgId();
        Building building = buildingRepository.findByOrganizationIdAndId(orgId, id)
                .orElseThrow(() -> new IllegalArgumentException("Building not found: " + id));
        if (updated.getName() != null && !updated.getName().isBlank()) building.setName(updated.getName());
        if (updated.getAddress() != null) building.setAddress(updated.getAddress());
        if (updated.getCity() != null) building.setCity(updated.getCity());
        if (updated.getState() != null) building.setState(updated.getState());
        if (updated.getPincode() != null) building.setPincode(updated.getPincode());
        if (updated.getTotalFloors() > 0) building.setTotalFloors(updated.getTotalFloors());
        building.setUpdatedAt(java.time.LocalDateTime.now());
        Building saved = buildingRepository.save(building);
        auditService.log("BUILDING_UPDATE", "Building", saved.getId().toString(), "Updated building " + saved.getName(), null);
        return saved;
    }

    @Transactional
    public void deleteBuilding(UUID id) {
        UUID orgId = TenantContext.getOrgId();
        Building building = buildingRepository.findByOrganizationIdAndId(orgId, id)
                .orElseThrow(() -> new IllegalArgumentException("Building not found: " + id));
        List<Unit> units = unitRepository.findAllByOrganizationIdAndBuildingId(orgId, id);
        unitRepository.deleteAll(units);
        buildingRepository.delete(building);
        auditService.log("BUILDING_DELETE", "Building", id.toString(), "Deleted building " + building.getName() + " and " + units.size() + " units", null);
    }

    @Transactional
    public Unit updateUnit(UUID id, Unit updated) {
        UUID orgId = TenantContext.getOrgId();
        Unit unit = unitRepository.findByOrganizationIdAndId(orgId, id)
                .orElseThrow(() -> new IllegalArgumentException("Unit not found: " + id));
        if (updated.getUnitNumber() != null && !updated.getUnitNumber().isBlank()) unit.setUnitNumber(updated.getUnitNumber());
        if (updated.getFloorNumber() >= 0) unit.setFloorNumber(updated.getFloorNumber());
        if (updated.getType() != null) unit.setType(updated.getType());
        if (updated.getAreaSqft() > 0) unit.setAreaSqft(updated.getAreaSqft());
        if (updated.getBaseRentPaise() >= 0) unit.setBaseRentPaise(updated.getBaseRentPaise());
        if (updated.getMaintenancePaise() >= 0) unit.setMaintenancePaise(updated.getMaintenancePaise());
        if (updated.getDepositPaise() >= 0) unit.setDepositPaise(updated.getDepositPaise());
        if (updated.getStatus() != null) unit.setStatus(updated.getStatus());
        if (updated.getPaymentStatus() != null) unit.setPaymentStatus(updated.getPaymentStatus());
        Unit saved = unitRepository.save(unit);
        auditService.log("UNIT_UPDATE", "Unit", saved.getId().toString(), "Updated unit " + saved.getUnitNumber(), null);
        return saved;
    }

    @Transactional
    public void deleteUnit(UUID id) {
        UUID orgId = TenantContext.getOrgId();
        Unit unit = unitRepository.findByOrganizationIdAndId(orgId, id)
                .orElseThrow(() -> new IllegalArgumentException("Unit not found: " + id));
        unitRepository.delete(unit);
        auditService.log("UNIT_DELETE", "Unit", id.toString(), "Deleted unit " + unit.getUnitNumber(), null);
    }
}
