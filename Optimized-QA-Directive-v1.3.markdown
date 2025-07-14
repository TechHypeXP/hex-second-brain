# Optimized Development Prompt v1.3: Security-First Code Quality & Project Management

## 🎯 Primary Objectives
1. **Eliminate security vulnerabilities from the onset** - Mandatory security assessment in every operation
2. **Prevent "under the carpet" solutions** - Comprehensive risk evaluation before any package changes
3. **Establish security-first development lifecycle** - Integrate vulnerability management into every phase
4. **Create persistent security knowledge base** - Track vulnerabilities, mitigations, and decisions

## 🔐 MANDATORY Security Assessment Protocol

### Phase 0: Pre-Installation Security Gate (NEW - CRITICAL)
**Execute this BEFORE any package installation or modification**

```bash
# 1. Security Baseline Assessment
- Run `npm audit` to establish vulnerability baseline
- Document all current vulnerabilities with severity levels
- Create security impact assessment for each vulnerability
- Identify critical path dependencies and their security status
- Generate vulnerability-to-functionality mapping

# 2. Pre-Installation Risk Analysis
- Analyze proposed package security history
- Check for known CVEs and security advisories
- Evaluate package maintenance status and update frequency
- Assess transitive dependency security posture
- Document security trade-offs and risk acceptance criteria
```

**Anti-Pattern Prevention**: 
- ❌ NEVER install packages without security review
- ❌ NEVER remove packages to "fix" security issues without functionality impact analysis
- ❌ NEVER accept "Will install with breaking changes" without security assessment

### Phase 0.5: Installation Security Monitoring (NEW)
**Execute this DURING any package installation**

```typescript
// Security monitoring checklist during installation:
interface SecurityMonitoring {
  preInstallBaseline: {
    vulnerabilities: VulnerabilityReport[];
    dependencyCount: number;
    securityScore: number;
  };
  postInstallAssessment: {
    newVulnerabilities: VulnerabilityReport[];
    resolvedVulnerabilities: VulnerabilityReport[];
    dependencyChanges: DependencyChange[];
    securityImpact: SecurityImpactAnalysis;
  };
  riskMitigation: {
    acceptedRisks: RiskAcceptance[];
    mitigationStrategies: MitigationPlan[];
    rollbackPlan: RollbackStrategy;
  };
}
```

## 🔧 Enhanced Pre-Analysis Protocol

### Phase 1: Security-Aware Project Architecture Mapping
**Execute this BEFORE every iteration/session with security focus**

```bash
# 1. Security-Enhanced Dependency Mapping
- Scan all import/export statements WITH security context
- Map file relationships and identify security-sensitive components
- Identify circular dependencies AND their security implications
- Document type declaration hierarchy WITH security boundaries
- Create visual dependency graph WITH security zones
- Verify all path aliases and security access controls
- Check for broken import chains AND potential security bypasses
- Audit third-party package security posture
```

**Enhanced Deliverable**: Security-aware project relationship matrix showing:
- File dependencies with security sensitivity levels
- Vulnerable package warnings and mitigation status
- Security boundary violations
- Access control integrity status
- Secure import chain verification
- Third-party package security assessment

### Phase 2: Security-Integrated Lint Setup
Implement security-aware linting validation:

```typescript
// Enhanced linting checks with security focus:
interface SecurityLinting {
  codeQuality: {
    eslint: "Standard ESLint + security plugin validation",
    typescript: "TypeScript strict mode + security type checking",
    imports: "Import/export consistency + security boundary validation",
    types: "Type declaration completeness + security type validation",
    unused: "Unused variable/import detection + dead code security review"
  };
  securitySpecific: {
    eslintSecurity: "ESLint security plugin for vulnerability detection",
    auditJs: "Audit-js for dependency vulnerability scanning",
    securityHeaders: "Security header validation for web components",
    inputSanitization: "Input sanitization and validation checks",
    authenticationFlow: "Authentication and authorization flow validation"
  };
}
```

## 📋 Security-Enhanced Systematic Review Process

### Step 1: Security-First Pre-Code Analysis
```markdown
1. **Security Dependency Audit** (NEW - CRITICAL)
   - Run comprehensive `npm audit` with detailed reporting
   - Categorize vulnerabilities by severity and exploitability
   - Identify direct vs transitive dependency vulnerabilities
   - Assess vulnerability impact on application security posture
   - Document security debt and remediation timeline

2. **Package Security Validation** (NEW)
   - Verify all imported packages have active security maintenance
   - Check for known security advisories and CVEs
   - Validate package authenticity and integrity
   - Assess package permission and access requirements
   - Review package dependency security recursively

3. **Functionality-Security Trade-off Analysis** (NEW)
   - Map critical functionality to vulnerable dependencies
   - Identify alternative secure packages for vulnerable components
   - Document security vs functionality trade-offs
   - Create risk acceptance criteria for each vulnerability
   - Establish security remediation priority matrix

4. **Traditional Code Analysis** (Enhanced)
   - File structure validation WITH security context
   - Export/import consistency WITH security boundaries
   - Type system review WITH security type validation
   - Naming conventions WITH security considerations
```

### Step 2: Security-Aware Linting Integration
```typescript
// Security-enhanced linting protocol:
const securityLintingChecklist = {
  traditional: {
    eslint: "Run ESLint with security plugin enabled",
    typescript: "Verify TypeScript compilation with security types",
    imports: "Validate import statements with security boundary checks",
    exports: "Check export consistency with security access controls",
    types: "Verify type declarations with security implications",
    unused: "Remove unused imports/variables with security review"
  },
  security: {
    vulnerabilities: "Scan for code-level security vulnerabilities",
    injections: "Check for SQL injection, XSS, and other injection risks",
    authentication: "Validate authentication and authorization flows",
    cryptography: "Review cryptographic implementations",
    dataValidation: "Ensure proper input validation and sanitization",
    secureHeaders: "Verify security headers and configurations"
  }
};
```

### Step 3: Enhanced Security Quality Gates
Every code change must pass:
- [ ] **Security Vulnerability Scan** (NEW - CRITICAL)
- [ ] **Dependency Security Assessment** (NEW)
- [ ] **Input Validation Review** (NEW)
- [ ] ESLint validation with security plugin (enhanced)
- [ ] TypeScript strict mode compilation with security types
- [ ] Import/export resolution with security boundary validation
- [ ] Type declaration consistency with security implications
- [ ] Dependency security posture verification

## 🛡️ Security Risk Assessment Framework (NEW)

### Vulnerability Impact Assessment Matrix
```typescript
interface VulnerabilityAssessment {
  vulnerability: {
    id: string;
    severity: 'low' | 'moderate' | 'high' | 'critical';
    cvss: number;
    description: string;
    affectedPackage: string;
    version: string;
  };
  impact: {
    functionality: 'none' | 'minimal' | 'moderate' | 'significant' | 'critical';
    dataExposure: 'none' | 'minimal' | 'sensitive' | 'critical';
    systemAccess: 'none' | 'limited' | 'elevated' | 'admin';
    networkExposure: 'none' | 'internal' | 'external' | 'public';
  };
  mitigation: {
    strategy: 'accept' | 'mitigate' | 'transfer' | 'avoid';
    timeline: 'immediate' | 'short-term' | 'medium-term' | 'long-term';
    alternatives: string[];
    workarounds: string[];
    monitoringRequired: boolean;
  };
  decision: {
    approved: boolean;
    approver: string;
    justification: string;
    reviewDate: Date;
    escalationRequired: boolean;
  };
}
```

### Security Decision Framework
```markdown
**Critical Decision Points for Package Management:**

1. **When vulnerabilities are discovered:**
   - ❌ NEVER simply remove the package without impact analysis
   - ✅ ALWAYS assess functionality impact first
   - ✅ ALWAYS explore secure alternatives
   - ✅ ALWAYS document risk acceptance if no alternatives exist

2. **When "npm audit fix --force" suggests breaking changes:**
   - ❌ NEVER apply without understanding the changes
   - ✅ ALWAYS review what will be changed
   - ✅ ALWAYS test functionality after security fixes
   - ✅ ALWAYS have rollback plan ready

3. **When security and functionality conflict:**
   - ❌ NEVER choose convenience over security
   - ✅ ALWAYS escalate to security team/lead
   - ✅ ALWAYS document trade-offs and time-bound decisions
   - ✅ ALWAYS implement monitoring for accepted risks
```

## 🧠 Security-Enhanced Knowledge Base Management

### Security-Aware Rolling Summary System
```markdown
## Security-Enhanced Session Knowledge Base Template

### Security Issues Encountered (NEW)
- **Vulnerabilities Found**: [Document each vulnerability with CVSS score, impact, and mitigation]
- **Package Security Status**: [Track security posture of all dependencies]
- **Security Decisions Made**: [Record all security vs functionality trade-offs]
- **Risk Acceptance**: [Document approved security risks with justification]

### Security Solutions Applied (NEW)
- **Vulnerability Remediation**: [List all security fixes applied with validation]
- **Secure Alternatives**: [Document secure package replacements]
- **Security Configurations**: [Record security-related configuration changes]
- **Monitoring Setup**: [Document security monitoring implemented]

### Traditional Issues Encountered (Enhanced)
- **Lint Issues**: [Document problems and solutions WITH security context]
- **Missing Files**: [Track missing files WITH security implications]
- **Type Conflicts**: [Record type-related problems WITH security boundaries]

### Security Prevention Measures (NEW)
- **Security Validation Rules**: [New security checks implemented]
- **Vulnerability Monitoring**: [Ongoing security monitoring setup]
- **Security Tool Configurations**: [Updated security tool settings]
- **Security Training Notes**: [Security learning and best practices]

### Next Session Security Preparation (NEW)
- **Known Security Issues**: [Carry-forward security problems]
- **Security Debt**: [Accumulated security technical debt]
- **Security Review Schedule**: [Planned security assessment dates]
- **Security Escalations**: [Issues requiring higher-level security review]
```

## 🛠️ Security-Enhanced Tools & Configurations

### Security-Specific Tools Integration (NEW)
```json
{
  "securityTools": {
    "npmAudit": {
      "purpose": "Primary dependency vulnerability scanning",
      "command": "npm audit --audit-level=low --json",
      "frequency": "Before every session and after every install",
      "priority": "CRITICAL - Must be clean before any deployment"
    },
    "auditJs": {
      "purpose": "Enhanced vulnerability scanning with detailed reporting",
      "command": "npx audit-js --format json --output security-report.json",
      "integration": "Complement to npm audit for comprehensive scanning"
    },
    "eslintSecurity": {
      "purpose": "Code-level security vulnerability detection",
      "plugin": "eslint-plugin-security",
      "config": "Enable all security rules in .eslintrc.json",
      "requirement": "Zero security-related ESLint errors"
    },
    "retireJs": {
      "purpose": "Detect use of vulnerable JavaScript libraries",
      "command": "npx retire --js --jspath src/",
      "integration": "Scan for vulnerable client-side libraries"
    },
    "bundleAnalyzer": {
      "purpose": "Analyze bundle for security implications",
      "command": "npx @next/bundle-analyzer",
      "focus": "Identify unexpected dependencies and their security posture"
    }
  },
  "securityMonitoring": {
    "dependencyTrack": {
      "purpose": "Continuous dependency vulnerability monitoring",
      "setup": "GitHub Dependabot or similar for automated alerts",
      "requirement": "Must be enabled for all repositories"
    },
    "securityHeaders": {
      "purpose": "Validate security headers implementation",
      "tool": "securityheaders.com integration",
      "requirement": "A+ security headers rating"
    },
    "sast": {
      "purpose": "Static Application Security Testing",
      "tool": "SonarQube or similar for code security analysis",
      "integration": "CI/CD pipeline integration required"
    }
  }
}
```

### Security-First Pre-Session Setup Checklist (Enhanced)
```markdown
**CRITICAL: Security-First Infrastructure Setup**

Phase 0: Security Baseline Assessment
- [ ] Run `npm audit` to establish security baseline
- [ ] Document all current vulnerabilities with severity assessment
- [ ] Create security impact matrix for each vulnerability
- [ ] Identify critical vs non-critical vulnerable dependencies
- [ ] Generate security remediation priority list

Phase 1: Security Tools Installation & Configuration
- [ ] Install eslint-plugin-security: `npm install --save-dev eslint-plugin-security`
- [ ] Install audit-js: `npm install -g audit-js`
- [ ] Install retire: `npm install -g retire`
- [ ] Configure security ESLint rules in .eslintrc.json
- [ ] Set up security monitoring tools

Phase 2: Security-Enhanced ESLint Configuration
- [ ] Add security plugin to ESLint configuration
- [ ] Enable all security rules with appropriate severity
- [ ] Configure security-specific type checking
- [ ] Test security ESLint rules: `npx eslint src/ --ext .ts,.tsx`
- [ ] Resolve all security-related ESLint errors

Phase 3: Security Analysis Tools Setup
- [ ] Run retire.js to check for vulnerable libraries
- [ ] Execute audit-js for comprehensive vulnerability report
- [ ] Generate security-focused dependency graph
- [ ] Validate security headers configuration
- [ ] Check for security-sensitive code patterns

Phase 4: Security-Aware Project State Verification
- [ ] Verify zero critical/high vulnerabilities
- [ ] Confirm all security ESLint rules pass
- [ ] Validate security boundaries in TypeScript compilation
- [ ] Ensure secure coding patterns are followed
- [ ] Document approved security risks with justification

Phase 5: Security Decision Documentation
- [ ] Record all security trade-offs made
- [ ] Document risk acceptance criteria
- [ ] Establish security review schedule
- [ ] Set up security monitoring alerts
- [ ] Create security incident response plan
```

## 🚨 Enhanced Anti-Pattern: Security-Aware Debugging Error Prevention

### Critical Security Rule: Security Impact Assessment Before Modifications
**NEVER modify packages or dependencies without security impact analysis**

```typescript
// MANDATORY pre-modification security protocol:
1. security_baseline_assessment() - Document current security posture
2. vulnerability_impact_analysis() - Assess security implications of changes
3. alternative_evaluation() - Identify secure alternatives
4. risk_acceptance_review() - Document security vs functionality trade-offs
5. apply_change_with_monitoring() - Implement with security monitoring
6. post_change_security_validation() - Verify security posture maintained
```

### Security-Specific Error Prevention Patterns

#### Security Error Type 1: "Under the Carpet" Vulnerability Management
```markdown
❌ WRONG: Removing vulnerable packages without impact analysis
✅ CORRECT: Comprehensive security impact assessment before any changes

// Security Prevention Protocol:
1. Document WHY the package is vulnerable and the specific risk
2. Assess what functionality depends on the vulnerable package
3. Research secure alternatives with equivalent functionality
4. If no alternatives exist, implement security mitigations
5. Document risk acceptance with approval and review timeline
6. Set up monitoring for the accepted security risk
```

#### Security Error Type 2: Ignoring Breaking Changes in Security Fixes
```markdown
❌ WRONG: Applying `npm audit fix --force` without understanding implications
✅ CORRECT: Thorough analysis of security fixes and their breaking changes

// Security Prevention Protocol:
1. Review exactly what `--force` will change
2. Assess functionality impact of each breaking change
3. Test critical functionality after security updates
4. Have rollback plan ready before applying changes
5. Document all functionality changes caused by security fixes
6. Update tests and documentation to reflect security-driven changes
```

#### Security Error Type 3: Security-Functionality False Dilemma
```markdown
❌ WRONG: Choosing either security OR functionality
✅ CORRECT: Finding security AND functionality balance through proper engineering

// Security Prevention Protocol:
1. Never accept "we can't have both security and functionality"
2. Invest time in finding secure alternatives
3. Implement security mitigations while maintaining functionality
4. Escalate to security team when trade-offs are unavoidable
5. Time-bound all security vs functionality compromises
6. Regularly reassess security decisions as ecosystem evolves
```

## 🔄 Security-Enhanced Continuous Improvement Loop

### After Each Session (Enhanced)
1. **Update security knowledge base** with new vulnerabilities and mitigations
2. **Refine security validation rules** based on encountered threats
3. **Enhance security tool configurations** for better detection
4. **Document security process improvements** for next session
5. **Record security decisions and their rationale** for future reference
6. **Schedule security debt remediation** based on accumulated risks

### Security Quality Assurance (NEW)
- Every code change validated against security checklist
- No code delivered without passing security quality gates
- Comprehensive security testing of all modifications
- Documentation of all security changes and rationale
- Mandatory security impact assessment for all dependency changes
- Regular security debt review and remediation planning

## 🚀 Security-First Implementation Protocol

When starting any development task:

1. **Load security knowledge base** from previous sessions
2. **Execute security-aware project mapping** to understand current threats
3. **Validate security tool configuration** and threat detection capabilities
4. **Run comprehensive security assessment** before making changes
5. **Apply security-enhanced review process** to all modifications
6. **Update security knowledge base** with new findings and decisions
7. **Prepare next session security context** for continuity
8. **Schedule security debt review** for accumulated risks

## 📊 Security Metrics and KPIs (NEW)

### Security Success Metrics
- **Vulnerability Count**: Target zero critical/high vulnerabilities
- **Security Debt**: Measured in days of accumulated security technical debt
- **Mean Time to Security Remediation**: Average time from vulnerability discovery to fix
- **Security Coverage**: Percentage of code covered by security analysis tools
- **Security Decision Quality**: Percentage of security decisions that were correct in retrospect

### Security Monitoring Dashboard
```typescript
interface SecurityDashboard {
  vulnerabilities: {
    critical: number;
    high: number;
    moderate: number;
    low: number;
    trend: 'improving' | 'stable' | 'degrading';
  };
  securityDebt: {
    totalDays: number;
    byCategory: Record<string, number>;
    remediationPlan: SecurityRemediationPlan;
  };
  securityCoverage: {
    codeAnalysis: number;
    dependencyScanning: number;
    securityTesting: number;
  };
  securityDecisions: {
    pending: SecurityDecision[];
    approved: SecurityDecision[];
    escalated: SecurityDecision[];
  };
}
```

This security-first approach ensures that we never sweep security issues under the carpet, always assess the full impact of our decisions, and maintain a strong security posture while delivering functionality. The key is treating security as a first-class citizen in our development process, not an afterthought.
