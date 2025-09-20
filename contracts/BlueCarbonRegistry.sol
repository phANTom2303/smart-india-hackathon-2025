// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract BlueCarbonRegistry {
    address public admin;

    enum OrganizationType { NGO, Panchayat }
    enum ProjectStatus { Registered, PendingVerification, Verified }

    struct Organization {
        uint id;
        string name;
        OrganizationType orgType;
        address walletAddress;
        bool isVerified;
    }

    struct Project {
        uint id;
        string name;
        uint orgId;
        string location;
        uint projectArea;
        string ipfsHash; // For initial project documents
        ProjectStatus status;
    }

    mapping(uint => Organization) public organizations;
    mapping(uint => Project) public projects;
    uint public nextOrgId = 1;
    uint public nextProjectId = 1;

    event OrganizationRegistered(uint indexed orgId, string name, address walletAddress);
    event OrganizationVerified(uint indexed orgId);
    event ProjectRegistered(uint indexed projectId, string name, uint orgId);

    constructor() {
        admin = msg.sender;
    }

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can call this function");
        _;
    }

    function registerOrganization(string memory _name, OrganizationType _orgType, address _walletAddress) public {
        organizations[nextOrgId] = Organization(nextOrgId, _name, _orgType, _walletAddress, false);
        emit OrganizationRegistered(nextOrgId, _name, _walletAddress);
        nextOrgId++;
    }

    function verifyOrganization(uint _orgId) public onlyAdmin {
        require(organizations[_orgId].id != 0, "Organization does not exist");
        organizations[_orgId].isVerified = true;
        emit OrganizationVerified(_orgId);
    }

    function registerProject(string memory _name, uint _orgId, string memory _location, uint _projectArea, string memory _ipfsHash) public {
        require(organizations[_orgId].isVerified, "Organization is not verified");
        require(msg.sender == organizations[_orgId].walletAddress, "Only the organization can register projects");

        projects[nextProjectId] = Project(nextProjectId, _name, _orgId, _location, _projectArea, _ipfsHash, ProjectStatus.Registered);
        emit ProjectRegistered(nextProjectId, _name, _orgId);
        nextProjectId++;
    }

    function updateProjectStatus(uint _projectId, ProjectStatus _status) public onlyAdmin {
        require(projects[_projectId].id != 0, "Project does not exist");
        projects[_projectId].status = _status;
    }
}