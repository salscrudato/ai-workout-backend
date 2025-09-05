#!/bin/bash

# 🚀 Production Testing Suite for AI Workout Backend
# Comprehensive testing script for the live production environment

set -e

# Configuration
PROD_URL="https://ai-workout-backend-2024.web.app"
TEST_USER_ID="prod-test-user-$(date +%s)"
AUTH_TOKEN="${FIREBASE_AUTH_TOKEN:-}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Test counters
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0
RESPONSE_TIMES=()

# Helper functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
    ((PASSED_TESTS++))
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
    ((FAILED_TESTS++))
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_section() {
    echo -e "\n${PURPLE}=== $1 ===${NC}"
}

# Enhanced test runner with timing
run_test() {
    local test_name="$1"
    local curl_command="$2"
    local expected_status="$3"
    local quality_check="${4:-}"
    
    ((TOTAL_TESTS++))
    log_info "Running: $test_name"
    
    # Measure response time
    start_time=$(date +%s%N)
    
    # Execute curl command and capture response
    response=$(eval "$curl_command" 2>/dev/null)
    status_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | head -n -1)
    
    end_time=$(date +%s%N)
    response_time=$(( (end_time - start_time) / 1000000 )) # Convert to milliseconds
    RESPONSE_TIMES+=($response_time)
    
    # Check status code
    if [[ "$status_code" == "$expected_status" ]]; then
        log_success "$test_name - Status: $status_code (${response_time}ms)"
        
        # Run quality check if provided
        if [[ -n "$quality_check" ]]; then
            eval "$quality_check" "$body"
        fi
        
        # Pretty print JSON response (first 500 chars)
        if command -v jq &> /dev/null; then
            echo "$body" | jq -C '.' 2>/dev/null | head -20 || echo "Response: ${body:0:500}..."
        else
            echo "Response: ${body:0:500}..."
        fi
    else
        log_error "$test_name - Expected: $expected_status, Got: $status_code (${response_time}ms)"
        echo "Response: $body"
    fi
    
    echo "----------------------------------------"
}

# Quality check functions
check_workout_quality() {
    local response="$1"
    
    # Check for essential workout components
    if echo "$response" | jq -e '.plan.warmup' > /dev/null 2>&1; then
        log_success "✓ Workout includes warmup"
    else
        log_warning "⚠ Workout missing warmup"
    fi
    
    if echo "$response" | jq -e '.plan.main' > /dev/null 2>&1; then
        log_success "✓ Workout includes main exercises"
    else
        log_error "✗ Workout missing main exercises"
    fi
    
    if echo "$response" | jq -e '.plan.cooldown' > /dev/null 2>&1; then
        log_success "✓ Workout includes cooldown"
    else
        log_warning "⚠ Workout missing cooldown"
    fi
    
    # Check for advanced features
    if echo "$response" | jq -e '.plan.main[0].sets[0].rpe' > /dev/null 2>&1; then
        log_success "✓ Includes RPE scores"
    fi
    
    if echo "$response" | jq -e '.plan.main[0].sets[0].tempo' > /dev/null 2>&1; then
        log_success "✓ Includes tempo prescriptions"
    fi
}

check_analytics_quality() {
    local response="$1"
    
    if echo "$response" | jq -e '.analytics.overview' > /dev/null 2>&1; then
        log_success "✓ Analytics includes overview metrics"
    fi
    
    if echo "$response" | jq -e '.analytics.behaviorPatterns' > /dev/null 2>&1; then
        log_success "✓ Analytics includes behavior patterns"
    fi
    
    if echo "$response" | jq -e '.analytics.recommendations' > /dev/null 2>&1; then
        log_success "✓ Analytics includes recommendations"
    fi
}

# Setup and validation
setup_test_environment() {
    log_section "Environment Setup"
    
    # Check if production server is accessible
    if ! curl -s "$PROD_URL/health" > /dev/null; then
        log_error "Production server is not accessible at $PROD_URL"
        exit 1
    fi
    
    log_success "Production server is accessible"
    
    # Check for auth token
    if [[ -z "$AUTH_TOKEN" ]]; then
        log_warning "No Firebase auth token provided. Set FIREBASE_AUTH_TOKEN environment variable."
        log_info "Some tests will be skipped that require authentication."
    else
        log_success "Firebase auth token provided"
    fi
    
    # Check for required tools
    if ! command -v jq &> /dev/null; then
        log_warning "jq not found. JSON responses will be truncated."
    fi
}

# Test Phase 1: Core Functionality
test_core_functionality() {
    log_section "Phase 1: Core Functionality"
    
    run_test "Health Check" \
        "curl -s -w '\n%{http_code}' '$PROD_URL/health'" \
        "200"
    
    run_test "Equipment Endpoint" \
        "curl -s -w '\n%{http_code}' '$PROD_URL/v1/equipment'" \
        "200"
    
    run_test "Performance Metrics" \
        "curl -s -w '\n%{http_code}' '$PROD_URL/v1/health/performance'" \
        "200"
    
    run_test "Optimization Recommendations" \
        "curl -s -w '\n%{http_code}' '$PROD_URL/v1/health/optimization-recommendations'" \
        "200"
}

# Test Phase 2: Authentication (if token available)
test_authentication() {
    if [[ -z "$AUTH_TOKEN" ]]; then
        log_section "Phase 2: Authentication (SKIPPED - No token)"
        return
    fi
    
    log_section "Phase 2: Authentication & Profile Management"
    
    # Create user profile
    run_test "Create User Profile" \
        "curl -s -w '\n%{http_code}' -X POST '$PROD_URL/v1/profile' \
        -H 'Content-Type: application/json' \
        -H 'Authorization: Bearer $AUTH_TOKEN' \
        -d '{
            \"age\": 30,
            \"sex\": \"male\",
            \"height\": 175,
            \"weight\": 70,
            \"experience\": \"intermediate\",
            \"goals\": [\"strength\", \"general_fitness\"],
            \"equipmentAvailable\": [\"bodyweight\", \"dumbbells\", \"resistance_bands\"],
            \"constraints\": [],
            \"health_ack\": true,
            \"data_consent\": true
        }'" \
        "201"
}

# Test Phase 3: AI Workout Generation
test_workout_generation() {
    if [[ -z "$AUTH_TOKEN" ]]; then
        log_section "Phase 3: Workout Generation (SKIPPED - No token)"
        return
    fi
    
    log_section "Phase 3: Enhanced AI Workout Generation"
    
    # Beginner workout
    run_test "Beginner Full Body Workout" \
        "curl -s -w '\n%{http_code}' -X POST '$PROD_URL/v1/workouts/generate' \
        -H 'Content-Type: application/json' \
        -H 'Authorization: Bearer $AUTH_TOKEN' \
        -d '{
            \"workoutType\": \"full_body\",
            \"equipmentAvailable\": [\"bodyweight\"],
            \"duration\": 30,
            \"experience\": \"beginner\",
            \"energyLevel\": 3,
            \"goals\": [\"general_fitness\"]
        }'" \
        "201" \
        "check_workout_quality"
    
    # Advanced strength workout
    run_test "Advanced Strength Workout" \
        "curl -s -w '\n%{http_code}' -X POST '$PROD_URL/v1/workouts/generate' \
        -H 'Content-Type: application/json' \
        -H 'Authorization: Bearer $AUTH_TOKEN' \
        -d '{
            \"workoutType\": \"strength\",
            \"equipmentAvailable\": [\"full_gym\"],
            \"duration\": 60,
            \"experience\": \"advanced\",
            \"energyLevel\": 4,
            \"goals\": [\"strength\", \"muscle_gain\"]
        }'" \
        "201" \
        "check_workout_quality"
    
    # Quick HIIT session
    run_test "Quick HIIT Session" \
        "curl -s -w '\n%{http_code}' -X POST '$PROD_URL/v1/workouts/generate' \
        -H 'Content-Type: application/json' \
        -H 'Authorization: Bearer $AUTH_TOKEN' \
        -d '{
            \"workoutType\": \"hiit\",
            \"equipmentAvailable\": [\"bodyweight\"],
            \"duration\": 20,
            \"experience\": \"intermediate\",
            \"energyLevel\": 5,
            \"goals\": [\"weight_loss\", \"endurance\"]
        }'" \
        "201" \
        "check_workout_quality"
}

# Test Phase 4: Frictionless UX
test_frictionless_ux() {
    if [[ -z "$AUTH_TOKEN" ]]; then
        log_section "Phase 4: Frictionless UX (SKIPPED - No token)"
        return
    fi
    
    log_section "Phase 4: Frictionless User Experience"
    
    run_test "Conversational Workout Generation" \
        "curl -s -w '\n%{http_code}' -X POST '$PROD_URL/v1/workouts/conversational' \
        -H 'Content-Type: application/json' \
        -H 'Authorization: Bearer $AUTH_TOKEN' \
        -d '{
            \"input\": \"I want a challenging 45-minute upper body workout with dumbbells\",
            \"context\": {}
        }'" \
        "200"
    
    run_test "Predictive Schedule" \
        "curl -s -w '\n%{http_code}' '$PROD_URL/v1/workouts/predictive-schedule?days=7' \
        -H 'Authorization: Bearer $AUTH_TOKEN'" \
        "200"
    
    run_test "Quick Start Options" \
        "curl -s -w '\n%{http_code}' '$PROD_URL/v1/workouts/quick-start-options' \
        -H 'Authorization: Bearer $AUTH_TOKEN'" \
        "200"
}

# Test Phase 5: Advanced Analytics
test_advanced_analytics() {
    if [[ -z "$AUTH_TOKEN" ]]; then
        log_section "Phase 5: Advanced Analytics (SKIPPED - No token)"
        return
    fi
    
    log_section "Phase 5: Advanced Analytics & Learning"
    
    # Get user ID from auth token (simplified - in real scenario you'd decode the JWT)
    USER_ID="test-user-analytics"
    
    run_test "User Analytics" \
        "curl -s -w '\n%{http_code}' '$PROD_URL/v1/analytics/user/$USER_ID' \
        -H 'Authorization: Bearer $AUTH_TOKEN'" \
        "200" \
        "check_analytics_quality"
    
    run_test "Learning Insights" \
        "curl -s -w '\n%{http_code}' '$PROD_URL/v1/analytics/learning-insights/$USER_ID' \
        -H 'Authorization: Bearer $AUTH_TOKEN'" \
        "200"
}

# Performance analysis
analyze_performance() {
    log_section "Performance Analysis"
    
    if [[ ${#RESPONSE_TIMES[@]} -eq 0 ]]; then
        log_warning "No response times recorded"
        return
    fi
    
    # Calculate statistics
    local total=0
    local min=${RESPONSE_TIMES[0]}
    local max=${RESPONSE_TIMES[0]}
    
    for time in "${RESPONSE_TIMES[@]}"; do
        total=$((total + time))
        if [[ $time -lt $min ]]; then min=$time; fi
        if [[ $time -gt $max ]]; then max=$time; fi
    done
    
    local avg=$((total / ${#RESPONSE_TIMES[@]}))
    
    echo "Response Time Statistics:"
    echo "  Average: ${avg}ms"
    echo "  Min: ${min}ms"
    echo "  Max: ${max}ms"
    echo "  Total Requests: ${#RESPONSE_TIMES[@]}"
    
    # Performance assessment
    if [[ $avg -lt 1000 ]]; then
        log_success "✓ Excellent average response time (${avg}ms)"
    elif [[ $avg -lt 2000 ]]; then
        log_warning "⚠ Good average response time (${avg}ms)"
    else
        log_error "✗ Slow average response time (${avg}ms)"
    fi
}

# Generate comprehensive report
generate_report() {
    log_section "Test Report Summary"
    
    echo "📊 Test Results:"
    echo "  Total Tests: $TOTAL_TESTS"
    echo "  Passed: $PASSED_TESTS"
    echo "  Failed: $FAILED_TESTS"
    
    if [[ $TOTAL_TESTS -gt 0 ]]; then
        local success_rate=$(( PASSED_TESTS * 100 / TOTAL_TESTS ))
        echo "  Success Rate: ${success_rate}%"
        
        if [[ $success_rate -ge 90 ]]; then
            log_success "🎉 Excellent! System is performing very well"
        elif [[ $success_rate -ge 75 ]]; then
            log_warning "⚠ Good performance with room for improvement"
        else
            log_error "❌ System needs significant improvements"
        fi
    fi
    
    analyze_performance
    
    echo ""
    echo "🎯 Next Steps:"
    if [[ $FAILED_TESTS -gt 0 ]]; then
        echo "  1. Fix failing endpoints"
        echo "  2. Investigate error causes"
        echo "  3. Improve error handling"
    fi
    
    echo "  4. Optimize slow endpoints"
    echo "  5. Enhance workout quality"
    echo "  6. Improve user experience"
    echo "  7. Add more comprehensive tests"
    
    # Exit with appropriate code
    if [[ $FAILED_TESTS -eq 0 ]]; then
        exit 0
    else
        exit 1
    fi
}

# Main execution
main() {
    echo "🚀 Starting Production Testing Suite for AI Workout Backend"
    echo "Production URL: $PROD_URL"
    echo "Timestamp: $(date)"
    echo ""
    
    setup_test_environment
    test_core_functionality
    test_authentication
    test_workout_generation
    test_frictionless_ux
    test_advanced_analytics
    generate_report
}

# Handle script arguments
case "${1:-}" in
    --help|-h)
        echo "Usage: $0 [options]"
        echo ""
        echo "Options:"
        echo "  --help, -h     Show this help message"
        echo "  --core-only    Run only core functionality tests"
        echo "  --auth-only    Run only authentication tests"
        echo "  --quick        Run a quick subset of tests"
        echo ""
        echo "Environment Variables:"
        echo "  FIREBASE_AUTH_TOKEN    Firebase authentication token for protected endpoints"
        echo ""
        echo "Example:"
        echo "  FIREBASE_AUTH_TOKEN='your-token' $0"
        exit 0
        ;;
    --core-only)
        setup_test_environment
        test_core_functionality
        generate_report
        ;;
    --auth-only)
        setup_test_environment
        test_authentication
        generate_report
        ;;
    --quick)
        setup_test_environment
        test_core_functionality
        test_authentication
        generate_report
        ;;
    *)
        main "$@"
        ;;
esac
