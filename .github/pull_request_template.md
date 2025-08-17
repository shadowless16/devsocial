# Pull Request

## Description
Brief description of changes made.

## Type of Change
- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update
- [ ] Performance improvement
- [ ] Code refactoring

## Checklist

### General
- [ ] My code follows the project's style guidelines
- [ ] I have performed a self-review of my code
- [ ] I have commented my code, particularly in hard-to-understand areas
- [ ] My changes generate no new warnings
- [ ] I have added tests that prove my fix is effective or that my feature works
- [ ] New and existing unit tests pass locally with my changes

### Database Changes
- [ ] Schema migrations are included (if applicable)
- [ ] Database indexes are properly configured
- [ ] Migration rollback tested (if applicable)

### API Changes
- [ ] API endpoints are properly documented
- [ ] Input validation is implemented
- [ ] Error handling is comprehensive
- [ ] Rate limiting considered (if applicable)

### Frontend Changes
- [ ] UI components are responsive
- [ ] Accessibility standards followed
- [ ] Loading states implemented
- [ ] Error states handled gracefully

### On-Chain Imprint Features (if applicable)
- [ ] Canonicalizer tests pass with sample vectors
- [ ] Imprint worker tests pass with mocked Hedera adapter
- [ ] Verify endpoint tests pass with mock data
- [ ] UI shows correct imprint status badges
- [ ] Explorer links work for confirmed transactions
- [ ] Duplicate detection working properly
- [ ] Monitoring metrics implemented
- [ ] Error logging comprehensive
- [ ] Documentation updated in `docs/imprint-flow.md`

### Security
- [ ] No sensitive data exposed in logs
- [ ] Input sanitization implemented
- [ ] Authentication/authorization checked
- [ ] No hardcoded secrets or credentials

### Performance
- [ ] Database queries optimized
- [ ] Caching implemented where appropriate
- [ ] Bundle size impact considered (frontend)
- [ ] Memory usage reasonable

### Testing
- [ ] Unit tests added/updated
- [ ] Integration tests pass
- [ ] Manual testing completed
- [ ] Edge cases considered

### Documentation
- [ ] README updated (if needed)
- [ ] API documentation updated
- [ ] Code comments added for complex logic
- [ ] Migration guide provided (for breaking changes)

## Testing Instructions
1. Step-by-step instructions for testing the changes
2. Include any setup requirements
3. Mention test data or accounts needed

## Screenshots (if applicable)
Add screenshots to help explain your changes.

## Related Issues
Closes #(issue number)

## Additional Notes
Any additional information that reviewers should know.