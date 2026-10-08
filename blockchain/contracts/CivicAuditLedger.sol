// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title CivicAuditLedger
 * @notice Tamper-evident on-chain audit ledger for CIVIC AI.
 * @dev Stores ONLY cryptographic hashes and metadata proofs.
 *      CRITICAL SECURITY RULE: NEVER STORE RAW PII (Aadhaar, income, bank details, names) ON-CHAIN.
 */
contract CivicAuditLedger {
    address public immutable owner;

    enum EventType {
        DOCUMENT_REGISTERED,
        APPLICATION_CREATED,
        APPLICATION_UPDATED,
        APPLICATION_STATUS_CHANGED,
        CONSENT_GRANTED,
        CONSENT_REVOKED,
        DOCUMENT_VERIFIED,
        GRIEVANCE_CREATED
    }

    struct AuditRecord {
        uint256 id;
        bytes32 anonymousUserHash; // SHA-256 / Keccak-256 of user UUID + salt
        EventType eventType;
        bytes32 dataHash;          // SHA-256 hash of off-chain verified state/doc
        uint256 timestamp;
        string referenceCode;      // e.g. "CIVIC-2026-000128" or "DOC-INC-892"
        string metadataUri;        // Optional content address proof
    }

    AuditRecord[] public auditRecords;
    mapping(string => uint256[]) private recordsByReference;
    mapping(bytes32 => uint256[]) private recordsByUser;

    event AuditLogged(
        uint256 indexed recordId,
        bytes32 indexed anonymousUserHash,
        EventType indexed eventType,
        bytes32 dataHash,
        uint256 timestamp,
        string referenceCode
    );

    constructor() {
        owner = msg.sender;
    }

    function recordAuditEvent(
        bytes32 _anonymousUserHash,
        EventType _eventType,
        bytes32 _dataHash,
        string calldata _referenceCode,
        string calldata _metadataUri
    ) external returns (uint256) {
        uint256 newId = auditRecords.length;
        AuditRecord memory record = AuditRecord({
            id: newId,
            anonymousUserHash: _anonymousUserHash,
            eventType: _eventType,
            dataHash: _dataHash,
            timestamp: block.timestamp,
            referenceCode: _referenceCode,
            metadataUri: _metadataUri
        });

        auditRecords.push(record);
        recordsByReference[_referenceCode].push(newId);
        recordsByUser[_anonymousUserHash].push(newId);

        emit AuditLogged(
            newId,
            _anonymousUserHash,
            _eventType,
            _dataHash,
            block.timestamp,
            _referenceCode
        );

        return newId;
    }

    function getRecordCount() external view returns (uint256) {
        return auditRecords.length;
    }

    function getRecord(uint256 _id) external view returns (AuditRecord memory) {
        require(_id < auditRecords.length, "Record does not exist");
        return auditRecords[_id];
    }

    function getRecordsByReference(string calldata _referenceCode) external view returns (uint256[] memory) {
        return recordsByReference[_referenceCode];
    }

    function verifyHash(uint256 _id, bytes32 _expectedHash) external view returns (bool) {
        require(_id < auditRecords.length, "Record does not exist");
        return auditRecords[_id].dataHash == _expectedHash;
    }
}
